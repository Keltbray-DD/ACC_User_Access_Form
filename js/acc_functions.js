

    async function fetchProjects() {
        const userID = sessionStorage.getItem('userID')
        console.log('userID Request',userID)
        const bodyData = {
            'userID': '',
            'requestType': 'accessRequest'
            };
    
        const headers = {
            'Content-Type':'application/json'
        };
    
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bodyData)
        };
    
        const apiUrl = "https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/30f57be09dd04690be4212eb4ed6df65/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=AKQMd6IhhtwV5Rid6zC7KTH3LPtniMWevgkP9UlSKko";
        //console.log(apiUrl)
        //console.log(requestOptions)
        responseData = await fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
    
            // console.log(JSONdata)
            
            return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));
    
    
        return responseData
    }
    

