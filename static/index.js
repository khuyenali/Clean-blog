let model
const threshold = 0.8;
const loadModel = async () => {
   model = await toxicity.load(threshold)
   console.log('Load done');
}

loadModel()
function CountCharacters() {
   var body = tinymce.get("content").getBody();
   var content = tinymce.trim(body.innerText || body.textContent);
   return content.length;
};

$('#mySend').click(async () => {
   const title = $('#title').val()
   const subtitle = $('#subtitle').val()
   const author = $('#author').val()
   const rawContent = tinymce.get('content').getContent()
   let content = tinymce.get('content').getContent({ format: 'text' })
   // content = content.replace(/\n/g, '.')
   content = content.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|")
   // console.log(content);
   const data = { title, subtitle, author, rawContent }

   for (let i = 0; i < content.length; i++) {
      let sentence = content[i]
      if(!sentence){
         continue
      }
      const predictions = await model.classify(sentence)
      // console.log(predictions[1]['results'][0]['match']);
      // console.log(predictions);
      let tmp = predictions.map(classify => {
         return { 'match': classify['results'][0]['match'], 'label': classify['label'] }
      })
      const toxicity = tmp.filter(result => result['match'] == true)
      // console.log(toxicity);
      if (toxicity.length > 0) {
         const invalid = toxicity.map(e => e['label']).join(', ')
         alert('Sorry, your post contain ' + invalid + ' content')
         return;
      }
   }

   const upload = async () => {
      const rawResponse = await fetch('http://127.0.0.1:5000/addpost', {
         method: 'POST',
         redirect: 'follow',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(data)
      });
      // console.log(rawResponse);
      if (rawResponse.redirected) {
         window.location.href = rawResponse.url;
      }
   };
   upload()
})// 
