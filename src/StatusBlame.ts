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
        if (mdview == null) { this.statusBarItemEl.setText("No blame"); return; }
        const Cursor = mdview.editor.getCursor();
        const TargetFile = mdview.file;
        const gita = this.lineAuthoringFeature.isAvailableOnCurrentPlatform();

        if (TargetFile == null || gita.available == false) { this.statusBarItemEl.setText("No blame"); return; }

        const TargetFilePath = TargetFile.path;
        gita.gitManager.blame(TargetFilePath, "inactive", true).then((blame) => {

            if (blame === "untracked") { this.statusBarItemEl.setText("No blame"); return; }

            const TargetHash = blame.hashPerLine[Cursor.line];
            const TargetBreamCommit = blame.commits.get(TargetHash);

            if (TargetBreamCommit?.author?.name === "Not Committed Yet") { this.statusBarItemEl.setText("No blame"); return; }
            if (TargetBreamCommit === undefined) { this.statusBarItemEl.setText("No blame"); return; }

            let deta = "";
            if (TargetBreamCommit.author === undefined) { this.statusBarItemEl.setText("No blame"); return; }


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

            const author = TargetBreamCommit.author.name;
            this.statusBarItemEl.setText(deta + " " + author);
        }).catch((err) => {
            console.log(err);
        });
    }
}
