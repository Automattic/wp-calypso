import { localize } from 'i18n-calypso';
import { Component } from 'react';

class UpdatedGravatarString extends Component {
	render() {
		const { translate, gravatarProfileLink } = this.props;
		const stringParts = {
			components: {
				spanLead: <strong className="profile__link-destination-label-lead" />,
				spanExtra: <span className="profile__link-destination-label-extra" />,
				profileLink: <a href={ gravatarProfileLink } target="_blank" rel="noreferrer" />,
				deleteLink: (
					<a href="https://gravatar.com/profile/disable-account" target="_blank" rel="noreferrer" />
				),
			},
		};
		return translate(
			'{{spanLead}}Hide my photo and Gravatar profile.{{/spanLead}} {{spanExtra}}This will prevent your photo and {{profileLink}}Gravatar profile{{/profileLink}} from appearing on any site. It may take some time for the changes to take effect. Gravatar profiles can be deleted at {{deleteLink}}Gravatar.com{{/deleteLink}}.{{/spanExtra}}',
			stringParts
		);
	}
}
export default localize( UpdatedGravatarString );
