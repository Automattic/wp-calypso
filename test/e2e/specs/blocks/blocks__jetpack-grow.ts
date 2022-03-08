/**
 * @group gutenberg
 */
import {
	BlockFlow,
	BusinessHoursFlow,
	WhatsAppButtonFlow,
	ContactFormFlow,
	PremiumContentBlockFlow,
	SubscribeFlow,
	ContactInfoBlockFlow,
	DataHelper,
	envVariables,
} from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new BusinessHoursFlow( { day: 'Sat' } ),
	new ContactFormFlow( { nameLabel: 'Angry dolphins flip swiftly' } ),
	new SubscribeFlow(),
	new ContactInfoBlockFlow( { email: 'foo@example.com', phoneNumber: '(213) 621-0002' } ),
	new WhatsAppButtonFlow( { phoneNumber: 1234567890, buttonText: 'Porpoises swim happily' } ),
];

// Interacting with the Premium Content toolbar is currently broken on mobile, so only adding for desktop:
// https://github.com/Automattic/jetpack/issues/22745
if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
	blockFlows.push(
		new PremiumContentBlockFlow( {
			subscriberTitle: DataHelper.getRandomPhrase(),
			subscriberText: DataHelper.getRandomPhrase(),
		} )
	);
}

createBlockTests( 'Blocks: Jetpack Grow', blockFlows );
