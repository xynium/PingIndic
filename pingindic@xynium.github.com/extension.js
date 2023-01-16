/* extension.js
 * Xynium sept 2022
 */

'use strict';

const Main = imports.ui.main;
//const Mainloop = imports.mainloop;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const ExtensionUtils = imports.misc.extensionUtils;
const Gettext = imports.gettext.domain('PingIndic');
const _ = Gettext.gettext;

const UPDTEDLY="update-interval";
const ADRESS='adress';
const LIMITFORGOOD = "limitforgood";
const LIMITFORBAD="limitforbad";

let mpingindic;
let settings;
let feedsArray;
let label; 
let tagWatchOUT ;
let tagWatchERR;
let timeout;

const Extension = GObject.registerClass(
class Extension extends PanelMenu.Button{
     _init () {
        super._init(0);

       // Label  voir les style at https://docs.gtk.org/Pango/pango_markup.html
        label = new St.Label({style_class: 'pingindic-label',y_align: Clutter.ActorAlign.CENTER,text: _("¡HOLA!")});
        let topBox = new St.BoxLayout();
        topBox.add_actor(label);

        this.add_actor(topBox);
        this.buildmenu();
    }

    buildmenu(){
        if (this.mainBox != null)
            this.mainBox.destroy();

        // Create main box
        this.mainBox = new St.BoxLayout();
        //this.mainBox.set_vertical(true);

        let customButtonBox = new St.BoxLayout({
            style_class: 'pingindic-button-box ',
            vertical: false,
            clip_to_allocation: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            reactive: true,
            x_expand: true,
            pack_start: false
        });

        // custom round preferences button
        let prefsButton = new St.Button();
        prefsButton.child = new St.Icon({
            icon_name: 'emblem-system' ,
            style_class: 'pingindic-button-action' 
        });
        let preflabBtn = new St.Button({style_class: 'pingindic-Btn-label',y_align: Clutter.ActorAlign.CENTER,label: _('Settings')});
        prefsButton.connect('clicked', () => {
            this.menu.actor.hide();
            ExtensionUtils.openPrefs(); 
        });
        preflabBtn.connect('clicked', () => {
            this.menu.actor.hide();
            ExtensionUtils.openPrefs(); 
        });
        customButtonBox.add_actor(prefsButton);
        customButtonBox.add_actor(preflabBtn);

        this.mainBox.add_actor(customButtonBox);
        this.menu.box.add(this.mainBox);
    }
    
    loadData() {
        let success;
        this.command = ["ping","-c 1",settings.get_string(ADRESS)];
        [success, this.child_pid, this.std_in, this.std_out, this.std_err] = GLib.spawn_async_with_pipes(
            null, 
            this.command, 
            null,
            GLib.SpawnFlags.SEARCH_PATH, 
            null);

        GLib.close(this.std_in);
        
        if (!success) {
            label.set_text(_("Ping Fail"));  //xxx for debug
            return;
        }

        this.IOchannelOUT = GLib.IOChannel.unix_new(this.std_out);
        this.IOchannelERR = GLib.IOChannel.unix_new(this.std_err);

        tagWatchOUT = GLib.io_add_watch(this.IOchannelOUT, GLib.PRIORITY_DEFAULT,
            GLib.IOCondition.IN | GLib.IOCondition.HUP, this.loadPipeOUT );
       
        tagWatchERR = GLib.io_add_watch(this.IOchannelERR, GLib.PRIORITY_DEFAULT,
            GLib.IOCondition.IN | GLib.IOCondition.HUP,this.loadPipeERR );
    }
    
     loadPipeOUT(channel, condition, data) {
        if (condition != GLib.IOCondition.HUP) {
            let out = channel.read_line(); //dummy
             out = channel.read_line();
            const result =  out[1].split('=');
            if(result[3] != null) {
                const val=result[3].split('\n');
                label.set_text(val[0]);
                setlabelstyle(val[0]); 
            }
        }
        else {
           label.set_text(_("Error time"));
           label.set_style_class_name('pingindic-label-bad' );
        }
        GLib.source_remove(tagWatchOUT);
        channel.shutdown(true);
        //GLib.spawn_close_pid(pid);
    }

    loadPipeERR(channel, condition, data) {
        if (condition != GLib.IOCondition.HUP) {
            label.set_text(_("Error acces"));
            label.set_style_class_name('pingindic-label-bad' );
        }
        GLib.source_remove(tagWatchERR);
        channel.shutdown(false);
        //GLib.spawn_close_pid(pid);
    }
});

function setlabelstyle(str){
    let time = parseFloat(str);
    if (time<settings.get_int(LIMITFORGOOD))
        label.set_style_class_name('pingindic-label-good' );
    else {
        if (time<settings.get_int(LIMITFORBAD))
            label.set_style_class_name('pingindic-label-nogood' );
        else
            label.set_style_class_name('pingindic-label-bad' );
            // label.set_style('color : #00FF00' );
    }
}

function update() {
    mpingindic.loadData();
    return GLib.SOURCE_CONTINUE;;
}

function init() {
}

function enable() {
    settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.pingindic');  
    mpingindic = new Extension();
    Main.panel.addToStatusArea('mpingindic', mpingindic, 0, 'right');
    timeout=GLib.timeout_add(GLib.PRIORITY_DEFAULT_IDLE,settings.get_int(UPDTEDLY)*1000, update );
}

function disable() {
    GLib.source_remove(timeout);
    mpingindic.destroy();
    mpingindic=null;
    settings=null;
    timeout=null;
    label=null;
    tagWatchOUT =null;
    tagWatchERR=null;
}

