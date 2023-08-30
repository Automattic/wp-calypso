/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import {
	BlockFlow,
	BusinessHoursFlow,
	WhatsAppButtonFlow,
	ContactFormFlow,
	PaidContentBlockFlow,
	SubscribeFlow,
	ContactInfoBlockFlow,
	DataHelper,
} from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new BusinessHoursFlow( { day: 'Sat' } ),
	new ContactFormFlow( { nameLabel: 'Angry dolphins flip swiftly' } ),
	new SubscribeFlow(),
	new ContactInfoBlockFlow( { email: 'foo@example.com', phoneNumber: '(213) 621-0002' } ),
	new WhatsAppButtonFlow( { phoneNumber: 1234567890, buttonText: 'Porpoises swim happily' } ),
	new PaidContentBlockFlow( {
		subscriberTitle: DataHelper.getRandomPhrase(),
		subscriberText: DataHelper.getRandomPhrase(),
	} ),
];

createBlockTests( 'Blocks: Jetpack Grow', blockFlows );
