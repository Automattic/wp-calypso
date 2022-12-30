import { ListTile, Gridicon } from '@automattic/components';
import Banner from 'calypso/components/banner';
const icons = [ 'custom-post-type', 'cloud', 'layout' ];

const BannerExample = () => (
	<div>
		<Banner disableHref title="A simple banner" />
		<Banner
			callToAction="Update"
			description="This is the description."
			disableHref
			showIcon
			title="Simple banner with description and call to action"
		/>
		<Banner
			callToAction="Update"
			disableHref
			showIcon={ false }
			title="Simple banner with description with custom body"
			body={
				<div style={ { display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' } }>
					{ icons.map( ( icon, idx ) => (
						<div key={ idx } style={ { marginRight: '12px', marginTop: '12px' } }>
							<ListTile
								title={ <h5>Feature name</h5> }
								leading={
									<div
										style={ {
											display: 'flex',
											marginRight: '10px',
											alignItems: 'center',
											borderRadius: '50%',
											justifyContent: 'center',
											flexShrink: 0,
											width: '24px',
											height: '24px',
											padding: '3px 4px 4px 3px',
											backgroundColor: 'var(--color-accent)',
											color: 'var(--color-text-inverted)',
										} }
									>
										<Gridicon icon={ icon } size={ 18 } />
									</div>
								}
								trailing={
									<div style={ { marginLeft: '8px', marginTop: '5px' } }>
										<Gridicon color="#C6C6C6" icon="info-outline" size={ 18 } />
									</div>
								}
							/>
						</div>
					) ) }
				</div>
			}
		/>
		<Banner showIcon={ false } title="Banner with showIcon set to false" />
		<Banner
			callToAction="Backup"
			description="New plugins can lead to unexpected changes. Ensure you can restore your site if something goes wrong."
			dismissPreferenceName="devdocs-banner-backups-example"
			dismissTemporary
			horizontal
			href="#"
			jetpack
			title="A Jetpack banner with a call to action"
		/>
	</div>
);

BannerExample.displayName = 'Banner';

export default BannerExample;
