/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./styles.css";

import { addChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { addContextMenuPatch, findGroupChildrenByChildId, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import { addAccessory, removeAccessory } from "@api/MessageAccessories";
import { addPreSendListener, removePreSendListener } from "@api/MessageEvents";
import { addButton, removeButton } from "@api/MessagePopover";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { ChannelStore, Menu, FluxDispatcher, UserStore } from "@webpack/common";

import { settings } from "./settings";
import { TranslateChatBarIcon, TranslateIcon } from "./TranslateIcon";
import { handleTranslate, TranslationAccessory } from "./TranslationAccessory";
import { translate } from "./utils";

const messageCtxPatch: NavContextMenuPatchCallback = (children, { message }) => () => {
    if (!message.content) return;

    const group = findGroupChildrenByChildId("copy-text", children);
    if (!group) return;

    group.splice(group.findIndex(c => c?.props?.id === "copy-text") + 1, 0, (
        <Menu.MenuItem
            id="vc-trans"
            label="Translate"
            icon={TranslateIcon}
            action={async () => {
                const trans = await translate("received", message.content);
                handleTranslate(message.id, trans);
            }}
        />
    ));
};

const alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./<>?;'’:\"[]{}\\|`~!@#$%^&*()_+-=\n ";

const autoTranslate = async ( msg ) => {
    const message = msg.message;

    if (!settings.store.autoFluent) return;

    if (!message.content) return;

    if (message.author.id == UserStore.getCurrentUser().id && msg?.sendMessageOptions) return;

    if (new RegExp(/( \u200c|\u200d |[\u2060-\u2064])[^\u200b]/).test(message.content)) return;

    message.content = message.content.replaceAll("­", "")

    if (message.content.split("").every(c => alphabets.includes(c))) return;

    const trans = await translate("received", message.content);

    if (trans.src == "en") return;

    handleTranslate(message.id, trans);
}


export default definePlugin({
<<<<<<< HEAD
    name: "EnhancedTranslate",
    description: "Translate messages with Google Translate\nEnhanced by TechFun",
    authors: [Devs.Ven, Devs.TechFun],
    dependencies: ["MessageAccessoriesAPI", "MessagePopoverAPI", "MessageEventsAPI"],
=======
    name: "Translate",
    description: "Translate messages with Google Translate",
    authors: [Devs.Ven],
    dependencies: ["MessageAccessoriesAPI", "MessagePopoverAPI", "MessageEventsAPI", "ChatInputButtonAPI"],
>>>>>>> upstream/main
    settings,
    // not used, just here in case some other plugin wants it or w/e
    translate,

    start() {
        FluxDispatcher.subscribe("MESSAGE_CREATE", autoTranslate);
        addAccessory("vc-translation", props => <TranslationAccessory message={props.message} />);

        addContextMenuPatch("message", messageCtxPatch);
        addChatBarButton("vc-translate", TranslateChatBarIcon);

        addButton("vc-translate", message => {
            if (!message.content) return null;

            return {
                label: "Translate",
                icon: TranslateIcon,
                message,
                channel: ChannelStore.getChannel(message.channel_id),
                onClick: async () => {
                    const trans = await translate("received", message.content);
                    handleTranslate(message.id, trans);
                }
            };
        });

        this.preSend = addPreSendListener(async (_, message) => {
            if (!settings.store.autoTranslate) return;
            if (!message.content) return;

            message.content = (await translate("sent", message.content)).text;
        });
    },

    stop() {
        FluxDispatcher.unsubscribe("MESSAGE_CREATE", autoTranslate);
        removePreSendListener(this.preSend);
        removeContextMenuPatch("message", messageCtxPatch);
        removeChatBarButton("vc-translate");
        removeButton("vc-translate");
        removeAccessory("vc-translation");
    },
});
