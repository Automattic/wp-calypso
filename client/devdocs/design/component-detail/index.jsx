/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import page from 'page';

/**
 * Internal dependencies
 */
import fetchComponentsUsageStats from 'state/components-usage-stats/actions';
import JSXTreeRenderer from 'components/jsx-tree-renderer';
import HeaderCake from 'components/header-cake';
import { findExample } from '../examples';
import Count from 'components/count';
import Card from 'components/card';
import Main from 'components/main';
import config from 'config';

const USAGE_STATS_ENABLED = config.isEnabled( 'devdocs/components-usage-stats' );

class ComponentDetail extends React.Component {
	static displayName = 'ComponentDetail';

	componentWillMount() {
		this.fetchUsageStats();
	}

	componentDidMount() {
		this.refs.tree.setTarget( this.refs.example );
	}

	backToComponents() {
		page( '/devdocs/design/' );
	}

	renderExample( Example ) {
		const name = getName( Example );
		const props = {
			ref: 'example',
			key: name
		};

		return <Example { ...props } />;
	}

	render() {
		const { component } = this.props;
		const Example = findExample( component );
		const name = getName( Example );

		return (
			<Main className="component-detail">
				<HeaderCake onClick={ this.backToComponents } backText="All Components">
					{ name }
				</HeaderCake>
				<h1 className="component-detail__title">{ name }</h1>
				<div className="component-detail__example">
					<div className="component-detail__tree">
						<JSXTreeRenderer ref="tree" />
					</div>
					<div className="component-detail__render">
						{ this.renderExample( Example ) }
					</div>
					<div className="component-detail__icon">
						<Gridicon icon="chevron-right" size={ 12 } />
					</div>
				</div>
				{ this.renderUsageStats( name ) }
			</Main>
		);
	}

	renderUsageStats( name ) {
		if ( ! USAGE_STATS_ENABLED ) {
			return;
		}

		const usageStats = this.getUsageStats( name );

		if ( ! usageStats ) {
			return;
		}

		const { count } = usageStats;
		const unit = `component${ count > 1 ? 's' : '' }`;

		return (
			<Card>Used in <Count count={ usageStats.count } /> { unit }.</Card>
		);
	}

	fetchUsageStats() {
		if ( USAGE_STATS_ENABLED ) {
			const { dispatchFetchComponentsUsageStats } = this.props;
			dispatchFetchComponentsUsageStats();
		}
	}

	getUsageStats( name ) {
		const { componentsUsageStats = {} } = this.props;
		const nameCamelCase = name[ 0 ].toLowerCase() + name.slice( 1 );
		return componentsUsageStats[ nameCamelCase ];
	}
}

function getName( Component ) {
	return ( Component.displayName || Component.name || '' )
		.replace( /Example$/, '' );
}

if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
	const mapStateToProps = ( state ) => {
		const { componentsUsageStats } = state;
		return componentsUsageStats;
	};

	const mapDispatchToProps = ( dispatch ) => {
		return bindActionCreators( {
			dispatchFetchComponentsUsageStats: fetchComponentsUsageStats
		}, dispatch );
	};

	ComponentDetail.propTypes = {
		componentsUsageStats: PropTypes.object,
		isFetching: PropTypes.bool,
		dispatchFetchComponentsUsageStats: PropTypes.func
	};

	ComponentDetail = connect(
		mapStateToProps,
		mapDispatchToProps
	)( ComponentDetail );
}

export default ComponentDetail;
