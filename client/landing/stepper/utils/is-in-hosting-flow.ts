import { isEnabled } from '@automattic/calypso-config';

export const isInHostingFlow = () => isEnabled( 'hosting-onboarding-i2' );
