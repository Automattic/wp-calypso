/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';

const ChecklistSiteSetup = ( { checklistMode } ) => {
	const translate = useTranslate();

	return (
		<>
			<Card className="checklist-site-setup">
				<CardHeading>{ translate( 'Site Setup List' ) }</CardHeading>
			</Card>
			<WpcomChecklist displayMode={ checklistMode } />
		</>
	);
};

export default ChecklistSiteSetup;
