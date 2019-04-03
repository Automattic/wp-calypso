/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import RootChild from 'components/root-child';
import { getSectionName } from 'state/ui/selectors';
import { shouldViewBeVisible } from 'state/ui/first-view/selectors';
import { hideView } from 'state/ui/first-view/actions';
import { isEnabled } from 'config';

/**
 * Style dependencies
 */
import './style.scss';

// component to avoid having a wrapper element for the transition
// see: https://facebook.github.io/react/docs/animation.html#rendering-a-single-child
const TransitionGroupComponent = props => {
	const children = React.Children.toArray( props.children );
	return children[ 0 ] || null;
};

class FirstView extends React.PureComponent {
	state = {
		isEnabled: false,
	};

	componentDidMount() {
		this.updateDocumentStyles();
	}

	componentDidUpdate() {
		this.updateDocumentStyles();
	}

	componentWillUnmount() {
		setTimeout( () => {
			this.updateDocumentStylesForHiddenFirstView();
		}, 0 );
	}

	render() {
		const classes = classNames( 'first-view', {
			'is-visible': this.props.isVisible,
		} );
		const firstViewContentClasses = classNames( 'first-view__content' );
		const firstViewHidePreferenceClasses = classNames( 'first-view__hide-preference' );

		return (
			<RootChild className={ classes }>
				<TransitionGroup component={ TransitionGroupComponent }>
					{ this.props.isVisible && (
						<CSSTransition classNames="first-view-transition" enter={ false } timeout={ 250 }>
							<Card key="content" className={ firstViewContentClasses }>
								{ this.props.children }

								<Button primary onClick={ this.hide }>
									{ this.props.translate( 'Got It!', {
										context: 'Button that dismisses the introduction overlay.',
									} ) }
								</Button>

								<div className={ firstViewHidePreferenceClasses }>
									<label>
										<input
											type="checkbox"
											checked={ ! this.state.isEnabled }
											onChange={ this.enableOrDisableNextTime }
										/>
										{ this.props.translate( "Don't show this again" ) }
									</label>
								</div>
							</Card>
						</CSSTransition>
					) }
				</TransitionGroup>
			</RootChild>
		);
	}

	hide = () => {
		this.props.hideView( { enabled: this.state.isEnabled } );
	};

	enableOrDisableNextTime = event => {
		this.setState( {
			isEnabled: ! event.target.checked,
		} );
	};

	updateDocumentStyles = () => {
		if ( this.props.isVisible ) {
			this.updateDocumentStylesForVisibleFirstView();
		} else {
			this.updateDocumentStylesForHiddenFirstView();
		}
	};

	updateDocumentStylesForVisibleFirstView = () => {
		document.documentElement.classList.add( 'no-scroll' );
		document.documentElement.classList.add( 'is-first-view-active' );
		setTimeout( () => {
			if ( this.props.isVisible ) {
				document.documentElement.classList.add( 'is-first-view-visible' );
			}
		}, 0 );
	};

	updateDocumentStylesForHiddenFirstView = () => {
		document.documentElement.classList.remove( 'no-scroll' );
		document.documentElement.classList.remove( 'is-first-view-visible' );
		// wait a bit so that we trigger the CSS transition
		setTimeout( () => {
			if ( ! this.props.isVisible ) {
				document.documentElement.classList.remove( 'is-first-view-active' );
			}
		}, 600 );
	};
}

export default connect(
	state => {
		return {
			sectionName: getSectionName( state ),
			isVisible: isEnabled( 'ui/first-view' ) && shouldViewBeVisible( state ),
		};
	},
	{
		hideView,
	}
)( localize( FirstView ) );
