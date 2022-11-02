import { SupportPageBlockAttributes } from './block';

export const SupportPageEmbed = ( props: { attributes: SupportPageBlockAttributes } ) => {
	return <div className="hb-support-page-embed">{ props.attributes.content }</div>;
};
