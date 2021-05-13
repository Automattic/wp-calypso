/**
 * External dependencies
 */
import { createContext } from 'react';
import moment from 'moment';

export default createContext( { moment, momentLocale: moment.locale() } );
