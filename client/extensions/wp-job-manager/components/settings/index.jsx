/**
 * External dependencies
 */
import React, { cloneElement, Children, Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import Navigation from '../navigation';
import QuerySettings from '../../data/query-settings';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getSettings, isFetchingSettings } from '../../state/settings/selectors';

class Settings extends Component {
	static propTypes = {
		children: PropTypes.element,
		isFetching: PropTypes.bool,
		settings: PropTypes.object,
		site: PropTypes.object,
		siteId: PropTypes.number,
		tab: PropTypes.string,
		translate: PropTypes.func,
	};

	state = {
		settings: {
			job_manager_category_filter_type: 'any',
			job_manager_date_format: 'relative',
			job_manager_enable_categories: false,
			job_manager_enable_default_category_multiselect: false,
			job_manager_enable_types: true,
			job_manager_google_maps_api_key: '',
			job_manager_hide_expired: true,
			job_manager_hide_expired_content: true,
			job_manager_hide_filled_positions: false,
			job_manager_multi_job_type: false,
			job_manager_per_page: 10,
		}
	};

	componentWillReceiveProps( nextProps ) {
		if ( this.props.settings === nextProps.settings ) {
			return;
		}

		this.setState( { settings: nextProps.settings } );
	}

	updateRadio = name => event => this.setState( { settings: { ...this.state.settings, [ name ]: event.target.value } } );

	updateTextInput = name => event => this.setState( { settings: { ...this.state.settings, [ name ]: event.target.value } } );

	updateToggle = name => () => this.setState( { settings: { ...this.state.settings, [ name ]: ! this.state.settings[ name ] } } );

	render() {
		const {
			children,
			isFetching,
			site,
			siteId,
			tab,
			translate,
		} = this.props;
		const mainClassName = 'wp-job-manager__main';

		return (
			<Main className={ mainClassName }>
				<QuerySettings siteId={ siteId } />
				<DocumentHead title={ translate( 'WP Job Manager' ) } />
				<Navigation activeTab={ tab } site={ site } />
				{
					Children.map( children, child => cloneElement( child, {
						isFetching,
						onRadioChange: this.updateRadio,
						onTextInputChange: this.updateTextInput,
						onToggleChange: this.updateToggle,
						settings: this.state.settings,
					} ) )
				}
			</Main>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			isFetching: isFetchingSettings( state, siteId ),
			settings: getSettings( state, siteId ),
			site: getSelectedSite( state ),
			siteId,
		};
	}
);

export default flowRight(
	connectComponent,
	localize,
)( Settings );
