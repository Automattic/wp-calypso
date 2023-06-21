import { get } from 'lodash';

import 'calypso/state/happychat/init';

export default ( state ) => get( state, 'happychat.ui.lostFocusAt' );
