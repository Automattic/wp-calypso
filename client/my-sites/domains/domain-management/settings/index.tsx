import { connect } from 'react-redux';
import Accordion from 'calypso/components/domains/accordion';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import SettingsHeader from './settings-header';
import { SettingsPageProps } from './types';

const Settings = ( props: SettingsPageProps ): JSX.Element => {
	const domain = props.domains && getSelectedDomain( props );

	return (
		<Main wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			<SettingsHeader domain={ domain } />
			Page goes here.
			{ /* Placeholder to test accordion */ }
			<div style={ { marginTop: '30px' } }>
				<Accordion title="First element title" subtitle="First element subtitle" expanded={ true }>
					<div>Component placeholder: this one is exapanded by default</div>
				</Accordion>
				<Accordion title="Second element title" subtitle="Second element subtitle">
					<div>Component placeholder: this one i'snt exapanded by default</div>
				</Accordion>
			</div>
		</Main>
	);
};

export default connect( ( state, ownProps: SettingsPageProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		hasDomainOnlySite: isDomainOnlySite( state, ownProps.selectedSite!.ID ),
	};
} )( Settings );
