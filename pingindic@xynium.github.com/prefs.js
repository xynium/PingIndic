/*
 * PingIndic by Xynium September 2022
 */
'use strict';
const {  Gio, Gtk ,GObject} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain('moonphases');
const _ = Gettext.gettext;

const UPDTEDLY="update-interval";
const ADRESS='adress';
const LIMITFORGOOD = "limitforgood";
const LIMITFORBAD="limitforbad";

function init() {
    ExtensionUtils.initTranslations('moonphases');
}

function buildPrefsWidget () {  
        let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.pingindic');
        let builder = new Gtk.Builder();
        builder.set_translation_domain('PingIndic');
        builder.add_from_file(Me.path + '/prefs.ui');

        // update interval
        let widjet0= builder.get_object("spbtnDly");
        settings.bind(UPDTEDLY, widjet0, 'value', Gio.SettingsBindFlags.DEFAULT);
        
        // indic style good
        let widjet1 = builder.get_object('spIndicGood');
        settings.bind(LIMITFORGOOD, widjet1, 'value', Gio.SettingsBindFlags.DEFAULT);
        
         // indic style bad
        let widjet3 = builder.get_object('spIndicBad');
        settings.bind(LIMITFORBAD, widjet3, 'value', Gio.SettingsBindFlags.DEFAULT);

        // Adress
        let widget2 = builder.get_object('eAdress');
        settings.bind(ADRESS, widget2, 'text', Gio.SettingsBindFlags.DEFAULT);

        return builder.get_object('prefs-container') ;
}
