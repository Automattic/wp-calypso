/**
 * @group gutenberg
 */
import { BlockFlow, BusinessHoursFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from '../specs-playwright/shared-specs/block-testing';

const blockFlows: BlockFlow[] = [ new BusinessHoursFlow( { day: 'Sat' } ) ];

createBlockTests( 'Blocks: Jetpack Grow', blockFlows );
