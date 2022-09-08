/*
 * PingIndic by Xynium September 2022
 */

const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain('PingIndic');
const _ = Gettext.gettext;

const UPDTEDLY="update-interval";
const ADRESS='adress';
const LIMITFORGOOD = "limitforgood";
const LIMITFORBAD="limitforbad";

const MyPrefsWidgetP = GObject.registerClass(
class MyPrefsWidgetP extends Gtk.Box {

    _init (params) {
        super._init(params);

        let builder = new Gtk.Builder();
        builder.set_translation_domain('PingIndic');
        builder.add_from_file(Me.path + '/prefs.ui');
        
        this.Settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.pingindic');

        // update interval
        let widjet0= builder.get_object("spbtnDly");
        this.Settings.bind(UPDTEDLY, widjet0, 'value', Gio.SettingsBindFlags.DEFAULT);
        
        // indic style good
        let widjet1 = builder.get_object('spIndicGood');
        this.Settings.bind(LIMITFORGOOD, widjet1, 'value', Gio.SettingsBindFlags.DEFAULT);
        
         // indic style bad
        let widjet3 = builder.get_object('spIndicBad');
        this.Settings.bind(LIMITFORBAD, widjet3, 'value', Gio.SettingsBindFlags.DEFAULT);

        // Adress
        let widget2 = builder.get_object('eAdress');
        this.Settings.bind(ADRESS, widget2, 'text', Gio.SettingsBindFlags.DEFAULT);

        this.add( builder.get_object('prefs-container') );
    }
});


function init() {
}


function buildPrefsWidget() {
    let widget = new MyPrefsWidgetP();
    widget.show_all();
    return widget;
}
