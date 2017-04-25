/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';
import { slugToCamelCase } from 'devdocs/docs-example/util';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import config from 'config';
import fetchComponentsUsageStats from 'state/components-usage-stats/actions';
import SearchCollection from './search-collection';
import SearchCard from 'components/search-card';
import HeaderCake from 'components/header-cake';
import { examples } from './examples';
import Main from 'components/main';

let DesignAssets = React.createClass( {
	displayName: 'DesignAssets',

	getInitialState() {
		return { filter: '' };
	},

	componentWillMount() {
		if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
			const { dispatchFetchComponentsUsageStats } = this.props;
			dispatchFetchComponentsUsageStats();
		}
	},

	onSearch( term ) {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	},

	backToComponents() {
		page( '/devdocs/design/' );
	},

	renderExamples() {
		return examples.map( Example => {
			return <Example key={ Example.displayName || Example.name } />;
		} );
	},

	render() {
		const { componentsUsageStats = {}, component } = this.props;
		const { filter } = this.state;

		return (
			<Main className="design">
				{ component
					? <HeaderCake onClick={ this.backToComponents } backText="All Components">
						{ slugToCamelCase( component ) }
					</HeaderCake>

					: <SearchCard
						onSearch={ this.onSearch }
						initialValue={ filter }
						placeholder="Search components…"
						analyticsGroup="Docs" />
				}

				<SearchCollection
					component={ component }
					filter={ filter }
				>
					{ this.renderExamples() }
				</SearchCollection>
			</Main>
		);
	}
} );

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

	DesignAssets.propTypes = {
		componentsUsageStats: PropTypes.object,
		isFetching: PropTypes.bool,
		dispatchFetchComponentsUsageStats: PropTypes.func
	};

	DesignAssets = connect(
		mapStateToProps,
		mapDispatchToProps
	)( DesignAssets );
}

export default DesignAssets;
