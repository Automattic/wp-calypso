import moment from 'moment';
import { createContext } from 'react';

export default createContext( { moment, momentLocale: moment.locale() } );
