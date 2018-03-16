/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Button from 'components/button';

const getClassName = ( className, placeholder ) =>
	classNames( className, placeholder ? 'is-placeholder' : null );

const GoogleMyBusinessLocation = ( {
	translate,
	title,
	text,
	href,
	verified,
	img,
	placeholder,
} ) => (
	<div>
		<div className="google-my-business-location__content">
			<img
				src={ img ? img : '/calypso/images/google-my-business/spacer.png' }
				className={ getClassName( 'google-my-business-location__image', placeholder ) }
				alt="gravatar"
			/>
			<div className="google-my-business-location__text-wrapper">
				<h2 className={ getClassName( 'google-my-business-location__header', placeholder ) }>
					{ title }
				</h2>
				<div className={ getClassName( 'google-my-business-location__text', placeholder ) }>
					{ text }
				</div>
				{ verified ? (
					<div className={ getClassName( 'google-my-business-location__verified', placeholder ) }>
						<Gridicon
							icon="checkmark-circle"
							className="google-my-business-location__verified-gridicon"
							size={ 18 }
						/>{' '}
						Verified
					</div>
				) : null }
			</div>
		</div>
		<Button
			href={ href }
			className={ getClassName( 'google-my-business-location__button', placeholder ) }
		>
			{ translate( 'Connect location' ) }
		</Button>
	</div>
);

GoogleMyBusinessLocation.propTypes = {
	recordTracksEvent: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	title: PropTypes.string,
	text: PropTypes.object,
	href: PropTypes.string,
	placeholder: PropTypes.bool,
	verified: PropTypes.bool,
};

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessLocation ) );
