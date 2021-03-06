import * as canvas from "canvas";
import * as fs from "fs";
import * as path from "path";

import IGenerator from "../generator";
import ColorUtils from "../../utils/color";

let bpath = path.join(__dirname, "..", "..", "assets");
let font = path.join(bpath, "fonts", "bontoutou.ttf");
let imgPath = path.join(bpath, "imgs", "bontoutou.png");

canvas.registerFont(font, {
    family: "Impact"
});

class BonToutou implements IGenerator {
    
    public getName(): string {
        return "bontoutou";
    }
    
    public generate(args): Promise<Buffer> {
        return new Promise(async function(resolve, reject){
            try {
                let name: string = < string > args.name;
                let qColors: string = < string > args.colors;
                let colors: string[];
                
                if(!name){
                    reject(new Error("Please specify name parameter"));
                }
                else if(name.length > 12){
                    reject(new Error("Name parameter must be no more than 12 characters"));
                }
                
                try {
                    colors = qColors.split("|").filter(n => n !== "");
                }
                catch(ex) {
                    colors = ["#4287f5"];
                }
                
                name = name.replace(/_/g, " ");
                name = name.toUpperCase();
                
                colors = ColorUtils.convert(colors);
                
                let x, y: number;
                let can: canvas.Canvas = canvas.createCanvas(256, 256);
                let ctx: canvas.CanvasRenderingContext2D = can.getContext("2d");
                let imgData: canvas.Image = await canvas.loadImage(imgPath);
                
                ctx.drawImage(imgData, 30, 15, can.width, can.height);
                ctx.font = "italic 60px Impact";
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.lineWidth = 3;
                
                x = 10;
                y = can.height - 50;
                
                ctx.fillText("BON", x, y);
                ctx.strokeText("BON", x, y);
                
                let fontAspect: number = 60;
                
                ctx.font = `italic ${fontAspect}px Impact`;
                
                while(ctx.measureText(name).width > can.width){
                    fontAspect--;
                    ctx.font = `italic ${fontAspect}px Impact`;
                }
                
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.textBaseline = "middle";
                
                x = 1;
                y = (can.height / 1.10) - name.length;
                
                if(colors.length <= 2){
                    let gradient: canvas.CanvasGradient = ctx.createLinearGradient(0, 0, colors.length * 100 + 50, colors.length * 100);
                    let offset: number = 0;
                    
                    colors.forEach(function(color: string){
                        gradient.addColorStop(offset, color);
                        offset++;
                    });
                    
                    ctx.fillStyle = gradient;
                    
                    ctx.fillText(name, x, y);
                    ctx.strokeText(name, x, y);
                }
                else {
                    let letters = name.split("");
                    
                    y = y - name.length;
                    
                    
                    while(colors.length < letters.length){
                        colors.push("#4287f5");
                    }

                    for(let i = 0 ; i < colors.length ; i++){
                        let letter = letters[i];

                        if(i === 0){
                            x = 1;
                        }
                        else {
                            if(letter === "I"){
                                x += ctx.measureText(letter).width * 2;
                            }
                            else {
                                if(letters[i - 1] === "I") {
                                    x += ctx.measureText(letter).width / 2;
                                } else {
                                    x += ctx.measureText(letter).width;
                                }
                            }
                        }
                        
                        ctx.fillStyle = colors[i];
                        
                        ctx.strokeText(letter, x, y);
                        ctx.fillText(letter, x, y);
                    }
                }
                
                ctx.fill();
                ctx.stroke();
                
                resolve(can.toBuffer());
            }
            catch(ex){
                reject(ex);
            }
        });
    }
}

export default BonToutou;