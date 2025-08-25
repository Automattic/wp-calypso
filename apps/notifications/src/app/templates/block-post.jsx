import { html } from '../../panel/indices-to-html';
import { p } from '../../panel/templates/functions';

const PostBlock = ( { block } ) => <div className="wpnc__post">{ p( html( block ) ) }</div>;

export default PostBlock;
