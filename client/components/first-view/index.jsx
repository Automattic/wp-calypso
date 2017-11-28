/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
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
		process.nextTick( () => {
			this.updateDocumentStylesForHiddenFirstView();
		} );
	}

	render() {
		const classes = classNames( 'first-view', {
			'is-visible': this.props.isVisible,
		} );
		const firstViewContentClasses = classNames( 'first-view__content' );
		const firstViewHidePreferenceClasses = classNames( 'first-view__hide-preference' );

		return (
			<RootChild className={ classes }>
				<ReactCSSTransitionGroup
					transitionName="first-view-transition"
					component={ TransitionGroupComponent }
					transitionEnter={ false }
					transitionEnterTimeout={ 0 }
					transitionLeaveTimeout={ 250 }
				>
					{ this.props.isVisible && (
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
					) }
				</ReactCSSTransitionGroup>
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
		process.nextTick( () => {
			if ( this.props.isVisible ) {
				document.documentElement.classList.add( 'is-first-view-visible' );
			}
		} );
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
