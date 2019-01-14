var logBaseUrl = 'https://api.jsonbin.io/b';
var secretKey = '$2a$10$HU43xxVDiRTqGEnItKjeiOUchrplL.Gj1oU6cPbhBVs6woqB208NO';

function PushLogData(binId, logData, successCallback, errorCallback) {
    GetLogData(
        binId,
        function(getLogDataResponse) {
            getLogDataResponse.Objects.push(logData);
            $.ajax({
                url: logBaseUrl + '/' + binId,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(getLogDataResponse),
                headers: { 'secret-key': secretKey },
                success: successCallback,
                error: errorCallback
            });
        },
        errorCallback
    );
}

function GetLogData(binId, successCallback, errorCallback) {
    $.ajax({
        url: logBaseUrl + '/' + binId + '/latest',
        headers: { 'secret-key' : secretKey },
        success: successCallback,
        error: errorCallback
    });
}