

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
    
        const apiUrl = "https://prod-09.uksouth.logic.azure.com:443/workflows/30f57be09dd04690be4212eb4ed6df65/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=LTEr0Q1hYKDoLnA5uWkU59tQcrDJn7scIZIiPHTQa2s";
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
    

