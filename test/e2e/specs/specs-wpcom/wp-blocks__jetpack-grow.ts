/**
 * @group gutenberg
 */
import {
	BlockFlow,
	BusinessHoursFlow,
	WhatsAppButtonFlow,
	ContactFormFlow,
	PremiumContentBlockFlow,
	SubscriptionFormBlockFlow,
	ContactInfoBlockFlow,
	DataHelper,
} from '@automattic/calypso-e2e';
import { createBlockTests } from '../specs-playwright/shared-specs/block-testing';

const blockFlows: BlockFlow[] = [
	new BusinessHoursFlow( { day: 'Sat' } ),
	new WhatsAppButtonFlow( { phoneNumber: 1234567890, buttonText: 'Porpoises swim happily' } ),
	new ContactFormFlow( { nameLabel: 'Angry dolphins flip swiftly' } ),
	new PremiumContentBlockFlow( {
		subscriberTitle: DataHelper.getRandomPhrase(),
		subscriberText: DataHelper.getRandomPhrase(),
	} ),
	new SubscriptionFormBlockFlow(),
	new ContactInfoBlockFlow( { email: 'foo@example.com', phoneNumber: '(213) 621-0002' } ),
];

createBlockTests( 'Blocks: Jetpack Grow', blockFlows );
