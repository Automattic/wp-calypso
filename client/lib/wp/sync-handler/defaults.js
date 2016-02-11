/**
 * Module dependencies
 */
import config from 'config';
import localforage from 'localforage';

// defaults
export const defaults = config( 'sync-handler-defaults' );

// set local forage driver through of its own constants
defaults.driver = localforage[ defaults.driver ];
