/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import noop from 'lodash/noop';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import SearchCard from 'components/search-card';

const DomainsLanding = React.createClass( {

	render() {
		const onSearch = ( searchTerm ) => {
			page( '/start/domain-first/?new=' + searchTerm );
		};

		const styles = {
			domainsLanding: {
				background: '#ffffff',
				fontSize: '18px',
				margin: '-32px -32px 0',
			},

			section: {
				borderBottom: '1px solid #dfdfdf',
				padding: '105px 0',
			},

			sectionContent: {
				color: '#3d596d',
				margin: '0 auto',
				maxWidth: '940px',
			},

			sectionBanner: {
				backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,.45)), linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.8) 100%), url(https://s1.wp.com/wp-content/themes/h4/landing/user-segments/images/banner-site.jpg)',
				backgroundSize: 'cover',
				padding: '105px 0',
			},

			mainHeading: {
				color: 'white',
				fontSize: '2em',
			},

			mainSubheading: {
				color: 'white',
				fontSize: '18px',
			},

			sectionHeading: {
				fontSize: '1.8em',
			},

			sectionCopy: {
				maxWidth: '60%',
			},

			sectionHeadingCenter: {
				fontSize: '1.8em',
				textAlign: 'center',
			},

			sectionCopyCenter: {
				margin: '0 auto',
				maxWidth: '80%',
				textAlign: 'center',
			},

			sectionInfo: {
				background: '#4f748e',
				padding: '50px 0',
			},

			sectionInfoContent: {
				display: 'flex',
				flex: '1',
				justifyContent: 'space-between',
				margin: '0 auto',
				maxWidth: '940px',
			},

			infoBlock: {
				color: 'white',
				fontSize: '16px',
				textAlign: 'center',
				width: '30%',
			}
		};

		return (
			<div style={ styles.domainsLanding }>
				<div style={ styles.sectionBanner }>
					<div style={ styles.sectionContent }>
						<h1 style={ styles.mainHeading }>{ i18n.translate( 'Find your new home on the web.' ) }</h1>
						<p style={ styles.mainSubheading }>
							{ i18n.translate( 'Search for the perfect address to claim your corner of the internet.' ) }
						</p>

						<SearchCard
							initialValue=""
							onSearch={ onSearch }
							onSearchChange={ noop }
							onBlur={ noop }
							placeholder={ i18n.translate( 'Enter a domain or keyword', { textOnly: true } ) }
							autoFocus={ true }
							delaySearch={ true }
							delayTimeout={ 1000 }
							dir="ltr"
							maxLength={ 60 }
						/>
					</div>
				</div>

				<div style={ styles.section }>
					<div style={ styles.sectionContent }>
						<h2 style={ styles.sectionHeadingCenter }>{ i18n.translate( 'Control your personal brand.' ) }</h2>

						<p style={ styles.sectionCopyCenter }>
							{ i18n.translate( "Own your domain and strengthen your brand. Don't rely on social networking sites. With your own domain name, it's much easier for customers or readers to find you." ) }
						</p>
					</div>
				</div>

				<div style={ styles.section }>
					<div style={ styles.sectionContent }>
						<h2 style={ styles.sectionHeading }>{ i18n.translate( 'The sky is the limit.' ) }</h2>

						<p style={ styles.sectionCopy }>
							{ i18n.translate( "Your new domain is just the start to building an online presence. When you're ready, create a beautiful website or blog with a single click." ) }
						</p>
					</div>
				</div>

				<div style={ styles.sectionInfo }>
					<div style={ styles.sectionInfoContent }>
						<div style={ styles.infoBlock }>
							{ i18n.translate( 'Add professional email with the click of a button.' ) }
						</div>
						<div style={ styles.infoBlock }>
							{ i18n.translate( 'Customize a free landing page until your idea is ready.' ) }
						</div>
						<div style={ styles.infoBlock }>
							{ i18n.translate( 'Edit DNS records with advanced domain management tools.' ) }
						</div>
					</div>
				</div>

				<div style={ styles.section }>
					<div style={ styles.sectionContent }>
						<h2 style={ styles.sectionHeading }>{ i18n.translate( "We're here to help." ) }</h2>

						<p style={ styles.sectionCopy }>
							{ i18n.translate( "Whether you're adding a site to your domain or editing your DNS records, our Happiness Engineers are ready to help." ) }
						</p>
					</div>
				</div>
			</div>
		);
	}
} );

export default DomainsLanding;
