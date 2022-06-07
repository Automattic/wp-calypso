import { Button, Card } from '@automattic/components';
import { register } from '@automattic/data-stores/src/reader';
import { select } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { cloneJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import getSites from 'calypso/state/selectors/get-sites';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function chooseSite( siteId, sites, onSelect ) {
	return (
		<FormFieldset>
			<FormLabel id="jetpack-clone-settings__choose-site">
				{ translate( 'Copy settings from:' ) }
			</FormLabel>

			<FormSelect onChange={ onSelect }>
				<option value="0"> - </option>
				{ sites
					.filter( ( site ) => site.jetpack && site.ID !== siteId )
					.sort( ( siteA, siteB ) => siteA.name.toLowerCase() > siteB.name.toLowerCase() )
					.map( ( site ) => (
						<option value={ site.ID } key={ site.ID }>
							{ site.name } ({ site.domain })
						</option>
					) ) }
			</FormSelect>

			<FormSettingExplanation>
				{ translate( 'Choose a Jetpack site to copy settings from.' ) }{ ' ' }
			</FormSettingExplanation>
		</FormFieldset>
	);
}

export default function CloneSettingsMain() {
	const siteId = useSelector( getSelectedSiteId );
	const sites = useSelector( getSites ) || [];
	const dispatch = useDispatch();

	const [ sourceSiteId, setSourceSiteId ] = useState( 0 );

	const isTeamMember = select( register() ).isA8cTeamMember();
	const isLoading = ! select( register() ).hasFinishedResolution( 'isA8cTeamMember' );

	const onSelect = useCallback( ( element ) => {
		const id = parseInt( element.target.value );
		if ( id ) {
			setSourceSiteId( element.target.value );
		}
	}, [] );

	const cloneSettingsCallback = useCallback( () => {
		if ( siteId && sourceSiteId ) {
			dispatch( cloneJetpackSettings( siteId, sourceSiteId ) );
		}
	}, [ siteId, sourceSiteId, dispatch ] );

	let body = isLoading ? 'Loading…' : 'Functionality is not available';

	if ( ! isLoading && isTeamMember ) {
		body = (
			<form>
				{ chooseSite( siteId, sites, onSelect ) }

				<Button primary onClick={ cloneSettingsCallback }>
					Clone Settings
				</Button>
			</form>
		);
	}

	return (
		<Main className="jetpack-clone-settings">
			<DocumentHead title="Jetpack Clone Settings" />
			<PageViewTracker path="/jetpack-clone-settings/:site" title="Jetpack Clone Settings" />

			<FormattedHeader
				brandFont
				className="jetpack-clone-settings__page-heading"
				headerText={ translate( 'Activity' ) }
				subHeaderText={ translate( 'Clone Jetpack settings from another site.' ) }
				align="left"
			/>

			<Card>{ body }</Card>
		</Main>
	);
}
