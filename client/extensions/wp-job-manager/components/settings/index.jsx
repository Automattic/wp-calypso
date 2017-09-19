/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import React, { cloneElement, Children, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { saveSettings } from '../../state/settings/actions';
import { getSettings, isFetchingSettings } from '../../state/settings/selectors';
import QuerySettings from '../data/query-settings';
import Navigation from '../navigation';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';

class Settings extends Component {
	static propTypes = {
		children: PropTypes.element,
		initialValues: PropTypes.object,
		isFetching: PropTypes.bool,
		siteId: PropTypes.number,
		tab: PropTypes.string,
		translate: PropTypes.func,
	};

	onSubmit = ( form, data ) => this.props.saveSettings( this.props.siteId, form, data );

	render() {
		const {
			children,
			initialValues,
			isFetching,
			siteId,
			tab,
			translate,
		} = this.props;
		const mainClassName = 'wp-job-manager__main';

		return (
			<Main className={ mainClassName }>
				<QuerySettings siteId={ siteId } />
				<DocumentHead title={ translate( 'WP Job Manager' ) } />
				<Navigation activeTab={ tab } />
				{
					Children.map( children, child => cloneElement( child, {
						initialValues,
						isFetching,
						onSubmit: this.onSubmit,
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
			initialValues: getSettings( state, siteId ),
			isFetching: isFetchingSettings( state, siteId ),
			siteId,
		};
	},
	{ saveSettings }
);

export default flowRight(
	connectComponent,
	localize,
)( Settings );
