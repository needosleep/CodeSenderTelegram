const vscode = require('vscode');
const axios = require('axios');

let chatId = '';
const botToken = '8072757536:AAE4gyb8RMGC1fhuwwKBV_a8cMkgGXN86jQ';

async function activate(context) {
    let setChatIdCommand = vscode.commands.registerCommand('extension.setChatId', async () => {
        while (true) {
            const input = await vscode.window.showInputBox({ prompt: 'Enter your telegram chat_id' });
            if (input) {
                try {
                    await axios.post(`https://api.telegram.org/bot${botToken}/getUpdates`, { chat_id: chatId, text: "test" });
                    chatId = input;
                    const userSettings = vscode.workspace.getConfiguration('codesendertelegram');
                    await userSettings.update('chatId', chatId, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(`chat_id is updated: ${chatId}`);
                    break;
                } catch (error) {
                    vscode.window.showErrorMessage(`error: ${error.message}`);
                    chatId = '';
                    continue;
                }
            } else {
                vscode.window.showWarningMessage('chat_id is not set');
                return;
            }
        }
    });

    let resetChatIdCommand = vscode.commands.registerCommand('extension.resetChatId', async() => {
        const userSettings = vscode.workspace.getConfiguration('codesendertelegram');
        chatId = '';
        await userSettings.update('chatId', chatId, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('chat_id has been reset');
    });

    let sendToTelegramCommand = vscode.commands.registerCommand('extension.sendToTelegram', async () => {
        const userSettings = vscode.workspace.getConfiguration('codesendertelegram');
        chatId = userSettings.get('chatId');

        if (!chatId) {
            const input = await vscode.window.showInputBox({ prompt: 'chat_id is not set' });
            if (input) {
                try {
                    chatId = input;
                    await userSettings.update('chatId', chatId, vscode.ConfigurationTarget.Global);
                } catch (error) {
                    vscode.window.showErrorMessage(`error: ${error.message}`);
                    chatId = '';
                }
            } else {
                vscode.window.showWarningMessage('chat_id is not set');
                return;
            }
        }

        try {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selectedText = editor.document.getText(editor.selection);
                if (selectedText) {
                    const message = `\`\`\`\n${selectedText}\n\`\`\``;
                    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, { chat_id: chatId, text: message, parse_mode: 'Markdown' });
                    vscode.window.showInformationMessage('code is sent');
                } else {
                    vscode.window.showWarningMessage('nothing is selected');
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`error: ${error.message}`);
            chatId = '';
        }
    });

    context.subscriptions.push(setChatIdCommand);
    context.subscriptions.push(resetChatIdCommand);
    context.subscriptions.push(sendToTelegramCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };
