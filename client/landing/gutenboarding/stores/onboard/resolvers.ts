/**
 * Internal dependencies
 */
import { setTemporaryAccount, setTemporaryBlog } from './actions';
import wpcom from '../../../../lib/wp';
import { NewSitePostData, NewUserPostData, TemporaryAccount, TemporaryBlog } from './types';


export function* getTemporaryBlog() {
    // @TODO: grab locale

    const siteParameters: NewSitePostData = {
        blog_name: 'hitheresomething123123123123', // could be taken from vertical or site name field
        blog_title: '',
        public: -1,
        options: {},
        validate: false,
        find_available_url: true,
    };

    const siteData = yield wpcom.undocumented().sitesNew( siteParameters, null );


    // @TODO: validate and normalize ?
    
    const temporarySiteResponse: TemporaryBlog = {
        url: siteData.url,
        id: siteData.blogid,
        title: siteData.blogname,
    };
    

    return setTemporaryBlog( temporarySiteResponse );
    
}


export function* getTemporaryAccount() {
    // @TODO: grab locale

    const userPostData: NewUserPostData = {
        email: `{yourgmailaddresshere}+${ Math.round( Math.random() * 1000000 ) }@gmail.com`,
        is_passwordless: true,
        validate: false,
        send_verification_email: false,
    };

    const userData  = yield wpcom.undocumented().usersNew( userPostData, null );

    // @TODO: validate and normalize ?

    const temporaryAccountResponse: TemporaryAccount = {
        userId: userData?.user_id ?? userData?.signup_sandbox_user_id,
        username: userData?.username ?? userData?.signup_sandbox_username,
        bearerToken: userData.bearer_token,
    };


    return setTemporaryAccount( temporaryAccountResponse );

}


