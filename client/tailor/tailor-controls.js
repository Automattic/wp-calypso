/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import ControlList from './control-list';
import { translate } from 'lib/mixins/i18n';

const TopNav = props => {
	const saveButtonText = props.isUnsaved ? translate( 'Save & Publish' ) : translate( 'Saved' );
	return (
		<div className="tailor-controls__top-nav">
			<Gridicon icon="cross-small" size={ 24 } className="tailor-controls__close-button" onClick={ props.onClose } />
			<Button compact primary className="tailor-controls__save-button" disabled={ ! props.isUnsaved } onClick={ props.onSave }>{ saveButtonText }</Button>
		</div>
	);
}

const Header = props => (
	<div className="tailor-controls__header">
		{ props.onClickBack ? <span className="tailor-controls__back-button" onClick={ props.onClickBack } ><Gridicon icon="chevron-left" size={ 24 } /></span> : '' }
		<div className="tailor-controls__header__info">{ props.firstLine }</div>
		<div className="tailor-controls__header__title">{ props.secondLine }</div>
	</div>
);

const TailorControls = React.createClass( {
	propTypes: {
		onSave: React.PropTypes.func.isRequired,
		onClickBack: React.PropTypes.func.isRequired,
		onClose: React.PropTypes.func.isRequired,
		isUnsaved: React.PropTypes.bool,
		activateControl: React.PropTypes.func.isRequired,
		showingControl: React.PropTypes.shape( {
			id: React.PropTypes.string.isRequired,
			title: React.PropTypes.string.isRequired,
			component: React.PropTypes.element.isRequired,
		} ),
		siteTitle: React.PropTypes.string,
		controls: React.PropTypes.arrayOf( React.PropTypes.shape( {
			id: React.PropTypes.string.isRequired,
			title: React.PropTypes.string.isRequired,
		} ) ),
	},

	renderControlList() {
		if ( this.props.showingControl ) {
			return this.props.showingControl.component;
		}
		return <ControlList controls={ this.props.controls } activateControl={ this.props.activateControl } />
	},

	renderHeader() {
		if ( this.props.showingControl ) {
			return <Header firstLine={ this.translate( 'Customizing' ) } secondLine={ this.props.showingControl.title } onClickBack={ this.props.onClickBack } />
		}
		return <Header firstLine={ this.translate( 'You are customizing' ) } secondLine={ this.props.siteTitle } />
	},

	render() {
		return (
			<div className="tailor-controls">
				<TopNav onSave={ this.props.onSave } onClose={ this.props.onClose } isUnsaved={ this.props.isUnsaved } />
				{ this.renderHeader() }
				{ this.renderControlList() }
			</div>
		);
	}
} );

export default TailorControls;
