import {load, Cheerio} from "cheerio";
import { EmbedBuilder, SKUFlagsString } from "discord.js";

/* 
classic -- 
quote -- 
ability -- 
emoji -- 
splash -- 
*/
class LoldleWrapper {

    gameTypes: Array<string>;
    names: Cheerio<string>;

    constructor() {
        this.gameTypes = [
            "classic",
            "quote",
            "ability",
            "emoji",
            "splash"
        ]
        //@ts-ignore
        this.names = [];
        this.getAllChamps();
    }

    async getAllChamps()
    {
        const url = "https://www.leagueoflegends.com/fr-fr/champions/";
        const req = await fetch(url);
        const $ = load(await req.text());
        const champions = $("div[data-testid='card-title']");
        
        const names = champions.map((i, el) => $(el).text());
        this.names = names;
    }

    async checkAnswer(championName: string, gameType: string)
    {
        if (!this.gameTypes.includes(gameType))
        {
            console.error("The gameType must be one of theses value: " + this.gameTypes.join(", "));
            return
        }

        const url = "https://loldle.apimeko.link/games/" + gameType + "/answer";
        const payload = {
            "name": championName,
            "utc": 2 // need this value for some reasons
        }
        const req = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        const res = await req.json();
        return res.valid === true;
        
    }
    
}

export class LoldleBot extends LoldleWrapper {

    async getAnswerGame(gameType: string): Promise<string>
    {
        // Edit these values depends on your need
        const REQ_PER_INTERVAL = 5;
        const INTERVAL = 1500;

        var i = 0;

        // Each INTERVAL ms we send REQ_PER_INTERVAL req
        return await new Promise(resolve => {
            const interval = setInterval(async () => {
                for (var _ = 0; _ < REQ_PER_INTERVAL; _++)
                {
                    const currChampName = this.names[i];
                    if (currChampName === undefined)
                        continue;
                    const j = i; // need this because if REQ_PER_INTERVAL is at least 5 it goes too fast

                    this.checkAnswer(
                        currChampName,
                        gameType
                    )
                        .then((answer) => {
                            console.log(`[${j}] ${gameType} game: ${currChampName} is ${answer ? "" : "not"} the answer`);
    
                            if (answer)
                            {
                                clearInterval(interval);
                                resolve(currChampName);
                            } 
                        })
    
                    i++;
                }
            }, INTERVAL)
        })

    }

    async getAllAnswers(): Promise<Array<{ gameType: string; answer: string; }>>
    {
        const timeBefore = new Date().getTime() / 1000;
        const answers = await Promise.all( this.gameTypes.map(async (gameType, index) => ({
            gameType: gameType,
            answer: await this.getAnswerGame(gameType)
        })) )
        const totalTime = new Date().getTime() / 1000 - timeBefore;
        console.log(`Found all the answers in ${totalTime} seconds `);
        console.log(answers);
        return (answers);
    }

    async getAnswersEmbed(answersArg: Array<{gameType: string; answer: string}> = [])
    {
        var answers = answersArg;
        if (answers.length === 0)
            answers = await this.getAllAnswers();

        // Get longest answer and all the spoiler answer will have the same length
        const longestAnswerLength = Math.max(...answers.map(elem => elem.answer.length));
        const padEndChar = "\u1CBC";
        const date = new Date();

        // SPoiler msg same length so no clue of the champs name
        return new EmbedBuilder()
            .setColor("#E8C14B")
            .setTitle(`Loldle answers ${date.getUTCDate()}/${date.getUTCMonth() < 10 ? '0' + (date.getUTCMonth() + 1) : date.getUTCMonth() + 1}/${date.getUTCFullYear()} `)
            .addFields(
                { name: "❓ Classic", value: `Answer: ||${answers[0].answer.padEnd(longestAnswerLength, padEndChar)}||` },
                { name: "\" Quote", value: `Answer: ||${answers[1].answer.padEnd(longestAnswerLength, padEndChar)}||` },
                { name: "🔥 Ability", value: `Answer: ||${answers[2].answer.padEnd(longestAnswerLength, padEndChar)}||` },
                { name: "😀 Emoji", value: `Answer: ||${answers[3].answer.padEnd(longestAnswerLength, padEndChar)}||` },
                { name: "🥸 Splash", value: `Answer: ||${answers[4].answer.padEnd(longestAnswerLength, padEndChar)}||` }
            )
            .setDescription("## [PLAY NOW](https://loldle.net/)")
    }

}

// Only work if dev mode
if ( process.argv.length === 3 && process.argv[2] === "dev" )
{
    (async () => {
        const bot = new LoldleBot();
        const answers = await bot.getAllAnswers();
        console.log(answers);

    })()
}