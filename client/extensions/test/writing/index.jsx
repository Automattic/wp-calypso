/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Button from 'components/button';
import Card from 'components/card';
import Banner from 'components/banner';
import FoldableCard from 'components/foldable-card';
import MediaSettings from 'my-sites/site-settings/media-settings';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import wrapSettingsForms from 'my-sites/site-settings/wrap-settings-form';

class JetpackWriting extends PureComponent {
	render() {
		const { fields, handleAutosavingToggle, isRequestingSettings, isSavingSettings, onChangeField, } = this.props;
		return (
			<Main className="writing jetpack-ui__writing">
				<Card>
					<h1>Writing</h1>
					<QueryJetpackModules siteId={ 0 } />
					<MediaSettings
						handleAutosavingToggle={ handleAutosavingToggle }
						onChangeField={ onChangeField }
						isSavingSettings={ isSavingSettings }
						isRequestingSettings={ isRequestingSettings }
						fields={ fields }
						siteId={ 0 }
					/>
					<Button onClick={ this.props.loadPage( '/test/discussion' ) }>Discussion</Button>
				</Card>
				<Banner title="WFT" description={ 'WTF!! A banner that works both in calypso and wp-admin?!?!?' } />
				<FoldableCard header={ 'A foldable card, also?' }>WOW!</FoldableCard>
			</Main>
		);
	}
}

export default wrapSettingsForms( () => ( {} ) )( JetpackWriting );