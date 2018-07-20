/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import classnames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { keys } from 'lodash';
import * as playgroundScopeForGutenbergBlocks from '@wordpress/components';

/**
 * Internal dependencies
 */
import config from 'config';
import * as examplesForComponents from 'devdocs/design/component-examples';
import * as examplesForGutenbergBlocks from 'gutenberg-blocks/examples';
import * as playgroundScopeForComponents from 'devdocs/design/playground-scope';
import DocumentHead from 'components/data/document-head';
import fetchComponentsUsageStats from 'state/components-usage-stats/actions';
import Main from 'components/main';
import DropdownItem from 'components/select-dropdown/item';
import SegmentedControl from 'components/segmented-control';
import SelectDropdown from 'components/select-dropdown';
import { getExampleCodeFromComponent } from './playground-utils';

const defaultCodeForComponents = `
	<HeaderCake actionText="Fun" actionIcon="status">Welcome to the Playground</HeaderCake>
	<Button primary onClick={
		function() {
			alert( 'World' )
		}
	}>
		<Gridicon icon="code" /> Hello
	</Button>
	<br /><hr /><br />
	<ActionCard
		headerText={ 'Change the code above' }
		mainText={ "The playground lets you drop in components and play with values. It's experiemental and likely will break." }
		buttonText={ 'WordPress' }
		buttonIcon="external"
		buttonPrimary={ false }
		buttonHref="https://wordpress.com"
		buttonTarget="_blank"
	/>
	<br /><hr /><br />
	<JetpackLogo />
	<SectionNav >
	  <NavTabs label="Status" selectedText="Published">
		  <NavItem path="/posts" selected={ true }>Published</NavItem>
		  <NavItem path="/posts/drafts" selected={ false }>Drafts</NavItem>
		  <NavItem path="/posts/scheduled" selected={ false }>Scheduled</NavItem>
		  <NavItem path="/posts/trashed" selected={ false }>Trashed</NavItem>
	  </NavTabs>
	
	  <NavSegmented label="Author">
		  <NavItem path="/posts/my" selected={ false }>Only Me</NavItem>
		  <NavItem path="/posts" selected={ true }>Everyone</NavItem>
	  </NavSegmented>
	
	  <Search
		  pinned
		  fitsContainer
		  placeholder="Search Published..."
		  delaySearch={ true }
	  />
	</SectionNav>
`;

const defaultCodeForGutenbergBlocks = `<Button isPrimary>Primary button</Button>`;

class DesignAssets extends React.Component {
	static displayName = 'DesignAssets';

	componentWillMount() {
		if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
			const { dispatchFetchComponentsUsageStats } = this.props;
			dispatchFetchComponentsUsageStats();
		}
	}

	state = {
		scope: 'components',
		code: defaultCodeForComponents,
	};

	backToComponents = () => {
		page( '/devdocs/design/' );
	};

	addComponent = exampleCode => () => {
		this.setState( {
			code: `${ this.state.code }\n\t${ exampleCode }`,
		} );
	};

	handleChange = code => {
		this.setState( {
			code: code,
		} );
	};

	listOfExamples() {
		let componentExamples = examplesForComponents;
		if ( 'gutenberg-blocks' === this.state.scope ) {
			componentExamples = examplesForGutenbergBlocks;
		}
		return (
			<SelectDropdown selectedText="Add a component" className="design__playground-examples">
				{ keys( componentExamples ).map( name => {
					const ExampleComponentName = componentExamples[ name ];
					const exampleComponent = <ExampleComponentName />;
					const exampleCode = getExampleCodeFromComponent( exampleComponent );
					return (
						exampleCode && (
							<DropdownItem key={ name } onClick={ this.addComponent( exampleCode ) }>
								{ name }
							</DropdownItem>
						)
					);
				} ) }
			</SelectDropdown>
		);
	}

	renderScopeSelector() {
		const scopes = [
			{ value: 'components', label: 'Components' },
			{ value: 'gutenberg-blocks', label: 'Gutenberg Blocks' },
		];

		return (
			<SegmentedControl
				options={ scopes }
				onSelect={ this.handleOnChangeScope }
				initialSelected={ this.state.scope }
				className="design__playground-scope"
			/>
		);
	}

	handleOnChangeScope = scope => {
		let code = defaultCodeForComponents;
		if ( 'gutenberg-blocks' === scope.value ) {
			code = defaultCodeForGutenbergBlocks;
		}
		this.setState( {
			code,
			scope: scope.value,
		} );
	};

	render() {
		const className = classnames( 'devdocs', 'devdocs__components', {
			'is-single': true,
			'is-list': ! this.props.component,
		} );

		let scope = playgroundScopeForComponents;
		if ( 'gutenberg-blocks' === this.state.scope ) {
			scope = playgroundScopeForGutenbergBlocks;
		}

		return (
			<Main className={ className }>
				<DocumentHead title="Playground" />
				<LiveProvider
					code={ `<div>${ this.state.code }</div>` }
					scope={ scope }
					mountStylesheet={ false }
					className="design__playground"
				>
					<div className="design__editor">
						<div className="design__error">
							<LiveError />
						</div>
						<LiveEditor />
					</div>
					<div className="design__preview">
						{ this.renderScopeSelector() }
						{ this.listOfExamples() }
						<LivePreview />
					</div>
				</LiveProvider>
			</Main>
		);
	}
}

if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
	const mapStateToProps = state => {
		const { componentsUsageStats } = state;

		return componentsUsageStats;
	};

	const mapDispatchToProps = dispatch => {
		return bindActionCreators(
			{
				dispatchFetchComponentsUsageStats: fetchComponentsUsageStats,
			},
			dispatch
		);
	};

	DesignAssets.propTypes = {
		componentsUsageStats: PropTypes.object,
		isFetching: PropTypes.bool,
		dispatchFetchComponentsUsageStats: PropTypes.func,
	};

	DesignAssets = connect(
		mapStateToProps,
		mapDispatchToProps
	)( DesignAssets );
}

export default DesignAssets;
