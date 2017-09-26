/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';
import get from 'lodash/get';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import PersonalGraphic from './personal-graphic';
import BusinessGraphic from './business-graphic';

class SelectBusinessPersonal extends React.Component {

	static propTypes = {
		signupDependencies: PropTypes.object,
		required: PropTypes.bool
	};

	render() {
		if ( ! this.props.current ) {
			return ( <div /> );
		}

		return (
			<div className="jpo-site-type__choices">
				<Card className={ classNames( 'jpo-site-type__choice', {
					'is-selected': 'personal' === get( this.props.signupDependencies, [ 'jpoSiteType', 'businessPersonal' ], '' )
				} ) }>
					<a className="jpo-site-type__choice-link" href="#" onClick={ this.props.onSelectPersonal }>
						<div className="jpo-site-type__image">
							<PersonalGraphic />
						</div>
						<div className="jpo-site-type__choice-copy">
							<Button className="jpo-site-type__cta" onClick={ this.props.onSelectPersonal }>
								{ translate( 'Personal site' ) }
							</Button>
						</div>
					</a>
				</Card>
				<Card className={ classNames( 'jpo-site-type__choice', {
					'is-selected': 'business' === get( this.props.signupDependencies, [ 'jpoSiteType', 'businessPersonal' ], '' )
				} ) }>
					<a className="jpo-site-type__choice-link" href="#" onClick={ this.props.onSelectBusiness }>
						<div className="jpo-site-type__image">
							<BusinessGraphic />
						</div>
						<div className="jpo-site-type__choice-copy">
							<Button className="jpo-site-type__cta" onClick={ this.props.onSelectBusiness }>
								{ translate( 'Business site' ) }
							</Button>
						</div>
					</a>
				</Card>
			</div>
		);
	}

}

export default SelectBusinessPersonal;
