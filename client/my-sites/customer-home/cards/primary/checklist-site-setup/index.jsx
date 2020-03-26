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

/**
 * Style dependencies
 */
import './style.scss';

const ChecklistSiteSetup = ( { checklistMode } ) => {
	const translate = useTranslate();

	return (
		<div className="checklist-site-setup">
			<Card className="checklist-site-setup__heading">
				<CardHeading>{ translate( 'Site Setup List' ) }</CardHeading>
			</Card>
			<WpcomChecklist displayMode={ checklistMode } />
		</div>
	);
};

export default ChecklistSiteSetup;
