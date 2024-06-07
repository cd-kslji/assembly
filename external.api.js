const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
const PORT = 3001;
const internalApi = "http://127.0.0.1:5000/user";

app.listen(PORT, () => {
    console.log(`External API started on port: ${PORT}`);
});

app.post('/ringba/urls', async (req, res) => {
    try {
        const { urls } = req.body;
        if (!urls || urls.length === 0) {
            return res.status(400).send({
                message: "No URLs found"
            });
        }

        let storeAudios = [], sendTranscript = [];
        for (let call of urls) {
            storeAudios.push(axios.put(internalApi, { user: call }));
        }

        storeAudios = await Promise.all(storeAudios);

        storeAudios.forEach((value) => {
            if (value && value.data && value.data.transcript) {
                sendTranscript.push(axios.get(`https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzNjA0M2M1MjZiNTUzNTUxMzci_pc?caller_id=[tag:InboundNumber:NumberE164]&date=[Call:CallDateTime]&campaign=[tag:User:utm_campaign]&adset=[tag:User:utm_adset]&revenue=[Call:ConversionAmount]&recording=[tag:Recording:RecordingUrl]&locationID=[tag:User:loc_physical_ms]&endsource=[tag:EndCall:EndCallSource]&duration=[tag:CallLength:Total]&term=[tag:User:utm_term]&target=[tag:Target:Name]&zip=[tag:Geo:ZipCode]&transcript=${value.data.transcript}`));
            } else {
                console.error("No transcript data found in the response.");
            }
        });

        await Promise.all(sendTranscript);

        res.status(200).send({
            message: "Completed all transcripts",
            error: null,
        });
    } catch (err) {
        console.error("Error processing request:", err);
        res.status(500).send({
            message: "Internal server error",
            error: err.message,
        });
    }
});
