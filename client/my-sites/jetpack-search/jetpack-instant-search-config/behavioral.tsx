/**
 * External dependencies
 */
import React, { ReactElement, Fragment } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import MultiCheckbox from 'calypso/components/forms/multi-checkbox';
import QueryPostTypes from 'calypso/components/data/query-post-types';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getPostTypes } from 'calypso/state/post-types/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type PostType = {
	public: boolean;
	label: string;
	name: string;
};

export default function JetpackSearchInstantSearchBehavioralConfig(): ReactElement {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) as number );
	const postTypes = useSelector(
		( state ) => getPostTypes( state, siteId ) as Record< string, PostType >
	);
	const publicPostTypes: PostType[] =
		typeof postTypes !== 'object'
			? []
			: Object.keys( postTypes )
					.map( ( key ) => postTypes[ key ] )
					.filter( ( postType ) => postType.public );
	const checkboxOptions = publicPostTypes.map( ( postType ) => ( {
		label: postType.label,
		value: postType.name,
	} ) );
	const disableCheckboxes = false; // TODO: checked.length - 1 === checkboxOptions.length

	return (
		<Fragment>
			{ siteId && <QueryPostTypes siteId={ siteId } /> }
			<SettingsSectionHeader
				id="jetpack-search-behavior-settings"
				showButton
				title={ translate( 'Behavioral', { context: 'Settings header' } ) }
			/>
			<Card>
				<FormFieldset className="jetpack-instant-search-config__default-sort">
					<FormLegend>{ translate( 'Default Sort' ) }</FormLegend>
					<FormRadiosBar
						checked="relevance"
						items={ [
							{
								label: translate( 'Relevance (recommended)', { context: 'Sort option' } ),
								value: 'relevance',
							},
							{
								label: translate( 'Newest first', { context: 'Sort option' } ),
								value: 'newest',
							},
							{
								label: translate( 'Oldest first', { context: 'Sort option' } ),
								value: 'oldest',
							},
						] }
					/>
				</FormFieldset>
				<FormFieldset className="jetpack-instant-search-config__-overlay-trigger">
					<FormLegend>{ translate( 'Search Input Overlay Trigger' ) }</FormLegend>
					<FormRadiosBar
						checked="immediate"
						items={ [
							{
								label: translate( 'Open when the user starts typing' ),
								value: 'immediate',
							},
							{
								label: translate( 'Open when results are available' ),
								value: 'results',
							},
						] }
					/>
				</FormFieldset>
				<FormFieldset className="jetpack-instant-search-config__excluded-post-types">
					<FormLegend>{ translate( 'Excluded Post Types' ) }</FormLegend>
					<MultiCheckbox
						options={ checkboxOptions }
						checked={ [] }
						disabled={ disableCheckboxes }
					/>
				</FormFieldset>
			</Card>
		</Fragment>
	);
}
