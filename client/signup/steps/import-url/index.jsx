/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
//import { get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
//import SignupActions from 'lib/signup/actions';

class ImportURLStepComponent extends Component {
	renderContent = () => {
		return (
			<div className="import-url__wrapper">
				Order of Merlin first class until the very end A History of Magic by Bathilda Bagshot
				Spinners End Magical Theory by Adalbert Waffling The Adventures of Marten Miggs the Mad
				Muggle Break with a Banshee Uagadou School of Magic in the Mountains of the Moon in Uganda
				Ron Weasley is our King, scars can come in handy Encyclopdia of Toadstools Uagadou School of
				Magic in the Mountains of the Moon in Uganda Hannah Abbott Weasleys Wizard Wheezes. Defeats
				the Dark Lord Grindelwald in 1945 You Know Who MadEye Moody Break with a Banshee Magical Me
				Agilbert Fontaine Voyages with Vampires Madam Primpernelles Beautifying Potions St Mungos
				Hospital for Magical Maladies and Injuries. Nosebleed Nougat Ilvermorny Quaffles Bludgers
				and broomsticks Sherbet lemons Cockroach Clusters hot cocoa raspberry jam Acid Pops Shell
				Cottage Time is making fools of us again One Thousand Magical Herbs and Fungi by Phyllida
				Spore.
			</div>
		);
	};

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ translate( 'Where can we find your old site?' ) }
				subHeaderText={ translate(
					"Enter your site's URL, sometimes called a domain name or site address.s"
				) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	null,
	null
)( localize( ImportURLStepComponent ) );
