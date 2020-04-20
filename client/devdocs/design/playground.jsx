/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import classnames from 'classnames';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { keys } from 'lodash';

/**
 * Internal dependencies
 */
import * as componentExamples from 'devdocs/design/component-examples';
import * as playgroundScope from 'devdocs/design/playground-scope';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SelectDropdown from 'components/select-dropdown';
import { getExampleCodeFromComponent } from './playground-utils';

/**
 * Style Dependencies
 */
import './playground.scss';
import './syntax.scss';

export default class DesignAssets extends React.Component {
	static displayName = 'DesignAssets';

	state = {
		code: `<Main>
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
          onSearch={ () => {} }
      />
    </SectionNav>
</Main>`,
	};

	backToComponents = () => {
		page( '/devdocs/design/' );
	};

	addComponent = ( exampleCode ) => () => {
		this.setState( {
			code:
				'<Main>' +
				this.state.code.replace( /(^<Main>)/, '' ).replace( /(<\/Main>$)/, '' ) +
				'\n\t' +
				exampleCode +
				'\n</Main>',
		} );
	};

	handleChange = ( code ) => {
		this.setState( {
			code: code,
		} );
	};

	listOfExamples() {
		return (
			<SelectDropdown selectedText="Add a component" className="design__playground-examples">
				{ keys( componentExamples ).map( ( name ) => {
					const ExampleComponentName = componentExamples[ name ];
					const exampleComponent = <ExampleComponentName />;
					const exampleCode = getExampleCodeFromComponent( exampleComponent );
					return (
						exampleCode && (
							<SelectDropdown.Item key={ name } onClick={ this.addComponent( exampleCode ) }>
								{ name }
							</SelectDropdown.Item>
						)
					);
				} ) }
			</SelectDropdown>
		);
	}

	render() {
		const className = classnames( 'devdocs', 'devdocs__components', {
			'is-single': true,
			'is-list': ! this.props.component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="Playground" />
				<LiveProvider
					code={ this.state.code }
					scope={ playgroundScope }
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
						{ this.listOfExamples() }
						<LivePreview />
					</div>
				</LiveProvider>
			</Main>
		);
	}
}
