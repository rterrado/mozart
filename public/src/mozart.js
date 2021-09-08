const mozart = {
    boot:()=>{
        $(document).ready(()=>{
            mozart.setSortable();
            let form = document.querySelector('[mozart-form]');
            form.onsubmit = mozart.form.submit.bind(form);
            $('[mozart-add-photo-url]').change(()=>{mozart.$inputs.photo.preview()});
            $('[mozart-add-photo-prompt-button]').click(()=>{mozart.$inputs.photo.showPrompt()});
        });
    },
    setSortable:()=>{
        mozart.sortable = $('[mozart-sortable]');
        mozart.sortable.sortable();
        mozart.sortable.disableSelection();
    },
    form:{
        submit:(e)=>{
            e.preventDefault();
            let items = {
                paragraphs: {
                    type: mozart.$inputs.paragraph.getType(),
                    content: mozart.$inputs.paragraph.get()
                }
            }
            mozart.$submit.present(items);
        }
    },
    type:(name,prop)=>{
        if (typeof mozart.$types=='undefined') {
            mozart.$types = new Object;
        }
        mozart.$types[name] = new Object;
        mozart.$types[name].$name = name;
        mozart.$types[name] = prop;
    },
    $inputs:{
        paragraph:{
            get:()=>{
                let paragraphs = document.querySelector('[mozart-add-paragraph]').value;
                return mozart.$inputs.paragraph.convert(paragraphs);
            },
            convert:(paragraphs)=>{
                let parSplit = paragraphs.split('\n');
                for (var i = 0; i < parSplit.length; i++) {
                    if (parSplit[i]==="" || parSplit[i]===" ") {
                        parSplit.splice(i,1);
                    }
                }
                return parSplit;
            },
            getType:()=>{
                return document.querySelector('[data-mozart-type]').dataset.mozartType;
            },
            clear:()=>{
                document.querySelector('[mozart-add-paragraph]').value = '';
            }
        },
        photo:{
            preview:()=>{
                let photoURL = document.querySelector('[mozart-add-photo-url]').value;
                $('[mozart-add-photo-preview]').html('<span id="mozart-photo-loading" class="mozart-loading-text">Loading photo...</span>');
                $('[mozart-add-photo-preview]').append('<img id="mozart-photo-previewer" class="mozart-photo-preview" src="'+photoURL+'"></img>');
                setTimeout(function(){
                    $('#mozart-photo-loading').hide();
                    $('#mozart-photo-previewer').show();
                }, 2000);
            },
            showPrompt:()=>{
                $('#add-photo-prompt').show();
            }
        }
    },
    $submit:{
        present:(items)=>{
            for (const [key, content] of Object.entries(items)) {

                if (!mozart.$types.hasOwnProperty(content.type)) {
                    console.error('mozart.js: undeclared content type: '+content.type);
                    return;
                }

                let typeName = content.type;

                if (typeof mozart.$types[typeName].template !== 'function') {
                    console.error('mozart.js: template requires to be a function for content type '+content.type);
                    return;
                }
                switch (typeName) {
                    case 'paragraph':
                        for (var i = 0; i < content.content.length; i++) {
                            let templateFunc = mozart.$types[typeName].template;
                            let templateObj = new Object;
                            templateObj.content = content.content[i];
                            templateObj.type = content.type;
                            templateObj.class = mozart.$types[typeName].widget.class;
                            templateObj.template = mozart.$submit.resolve(templateObj,templateFunc);
                            mozart.$submit.push(templateObj);
                        }
                        break;
                    default:

                }



            }
        },
        getType:()=>{

        },
        resolve:(obj,func)=>{
            return func(obj);
        },
        push:(templateObj)=>{

            if (!templateObj.hasOwnProperty('id')) {
                let d = new Date();
                let e = d.getTime();
                let r = Math.floor((Math.random() * 1000) + 1);
                templateObj.id = (e * 1000)+r;
            }

            mozart.$storage.save(templateObj);

            $('[mozart-sortable]').append('<li id="'+templateObj.id+'" mozart-sortable-item class="'+templateObj.class+'">'+templateObj.template+'</li>');
            mozart.$inputs.paragraph.clear();
        }
    },
    $storage:{
        save:(templateObj)=>{

            let cleanData = {}

            // Removing unncessary data
            for (let key of Object.keys(templateObj)) {
                if ((key!=='template')&&(key!=='class')) {
                    cleanData[key] = templateObj[key];
                }
            }
            mozart.$storage.data[templateObj.id] = cleanData;
        },
        data: []
    }
}

mozart.boot();
