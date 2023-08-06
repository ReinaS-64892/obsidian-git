import { MarkdownView, Plugin, moment } from "obsidian";
import { LineAuthoringFeature } from "src/lineAuthor/lineAuthorIntegration";

export class StatusBlame {
    plugin: Plugin;
    statusBarItemEl: HTMLElement;
    lineAuthoringFeature: LineAuthoringFeature;


    constructor(plugin: Plugin, statusBarItemEl: HTMLElement, lineAuthoringFeature: LineAuthoringFeature) {
        this.plugin = plugin;
        this.statusBarItemEl = statusBarItemEl;
        this.lineAuthoringFeature = lineAuthoringFeature;

        plugin.registerDomEvent(document, 'keydown', (keyev: KeyboardEvent) => {
            this.update_status();
        });
        plugin.registerDomEvent(document, 'click', (MowE: MouseEvent) => {
            this.update_status();
        });
    }

    update_status(): void {
        const mdview = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (mdview) {
            const Cursor = mdview.editor.getCursor();
            const TargetFile = mdview.file;
            const gita = this.lineAuthoringFeature.isAvailableOnCurrentPlatform();

            if (TargetFile && gita.available) {

                const TargetFilePath = TargetFile.path;
                // console.log(TargetFilePath);
                gita.gitManager.blame(TargetFilePath, "inactive", true).then((blame) => {
                    if (blame !== "untracked") {

                        const TargetHash = blame.hashPerLine[Cursor.line];
                        const TargetBreamCommit = blame.commits.get(TargetHash);

                        console.log(blame);
                        console.log(TargetBreamCommit);

                        if (TargetBreamCommit?.author?.name === "Not Committed Yet") {
                            this.statusBarItemEl.setText("No blame");
                        }


                        if (TargetBreamCommit !== undefined) {
                            let deta = "";
                            if (TargetBreamCommit.author) {
                                let authoringDate: moment.Moment = moment.unix(
                                    TargetBreamCommit.author.epochSeconds
                                );
                                authoringDate = authoringDate.utcOffset(
                                    TargetBreamCommit.author.tz
                                );


                                deta = authoringDate.year() + "年";
                                deta += authoringDate.month() + 1 + "月";
                                deta += authoringDate.date() + "日";
                                deta += authoringDate.hour() + "時";
                                deta += authoringDate.minute() + "分";
                                deta += authoringDate.second() + "秒";
                            }
                            const author = TargetBreamCommit.author != null ? TargetBreamCommit.author.name : "";

                            this.statusBarItemEl.setText(deta + " " + author);
                        }
                        else {
                            this.statusBarItemEl.setText("No blame");
                        }

                    } else {

                        this.statusBarItemEl.setText("No blame");

                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    }

}
