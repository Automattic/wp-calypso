/**
 * External dependencies
 */
import page from 'page';
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import PlanCompareCard from 'my-sites/plan-compare-card';
import styles from './styles';

class Manage extends React.Component {

	render() {
		const { domain } = this.props;
		return (
			<Main wideLayout>
				<h2 className={ styles.header }>What do you want to use { domain } for?</h2>
				<div className={ styles.manageContainer }>
					<PlanCompareCard
						title="Landing Page"
						line="Customize a simple, one-page placeholder."
						buttonName="Create a landing page"
						onClick={ () => page( '/domains-prototype/manage/landing-page/' + domain ) }
						currentPlan={ false } />

					<PlanCompareCard
						title="New Site"
						line="Build a new website or blog."
						buttonName="Create a new site"
						onClick={ () => page( '/domains-prototype/manage/start/' + domain ) }
						currentPlan={ false } />

					<PlanCompareCard
						title="Existing Site"
						line="Connect an existing website or redirect to your social media."
						buttonName="Connect a site"
						onClick={ () => page( '/domains-prototype/manage/connect/' + domain ) }
						currentPlan={ false } />

					<PlanCompareCard
						title="Add Email"
						line="Add professional email to your domain."
						buttonName="Set up email"
						onClick={ () => page( '/domains/manage/email/' + domain ) }
						currentPlan={ false } />
				</div>
			</Main>
		);
	}
}

Manage.propTypes = {
	domain: PropTypes.string.required
};

export default withStyles( styles )( Manage );
