import { isCardDismissed } from 'calypso/blocks/dismissible-card/selectors';
import { UPWORK_BANNER_STATE } from './constants';

export const isUpworkBannerDismissed = isCardDismissed( UPWORK_BANNER_STATE );
