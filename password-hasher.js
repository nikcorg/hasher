(function (document, undefined) {
    var salt = '<?php echo $salt ?>',
        limit = <?php echo $limit ?>;

    /**
     *
     *  Secure Hash Algorithm (SHA1)
     *  http://www.webtoolkit.info/javascript-sha1.html
     *  http://www.webtoolkit.info/licence
     *
     */

    function SHA1 (msg) {
        function rotate_left(n,s) {
            var t4 = (n<<s) | (n>>>(32-s));
            return t4;
        }

        function lsb_hex(val) {
            var str='', i, vh, vl;

            for( i=0; i<=6; i+=2 ) {
                vh = (val>>>(i*4+4))&0x0f;
                vl = (val>>>(i*4))&0x0f;
                str += vh.toString(16) + vl.toString(16);
            }
            return str;
        }

        function cvt_hex(val) {
            var str='', i, v;

            for(i=7; i>=0; i-- ) {
                v = (val>>>(i*4))&0x0f;
                str += v.toString(16);
            }
            return str;
        }

        function Utf8Encode(string) {
            var utftext = '', n, c;
            string = string.replace(/\r\n/g,'\n');

            for (n = 0; n < string.length; n++) {
                c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        }

        var blockstart,
            i,
            j,
            W = [80],
            H0 = 0x67452301,
            H1 = 0xEFCDAB89,
            H2 = 0x98BADCFE,
            H3 = 0x10325476,
            H4 = 0xC3D2E1F0,
            A, B, C, D, E,
            temp;

        msg = Utf8Encode(msg);

        var msg_len = msg.length,
            word_array = [];

        for( i=0; i<msg_len-3; i+=4 ) {
            j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
            msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
            word_array.push( j );
        }

        switch( msg_len % 4 ) {
            case 0:
                i = 0x080000000;
            break;
            case 1:
                i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
            break;

            case 2:
                i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
            break;

            case 3:
                i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8    | 0x80;
            break;
        }

        word_array.push( i );

        while( (word_array.length % 16) != 14 ) word_array.push( 0 );

        word_array.push( msg_len>>>29 );
        word_array.push( (msg_len<<3)&0x0ffffffff );

        for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {

            for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
            for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

            A = H0;
            B = H1;
            C = H2;
            D = H3;
            E = H4;

            for( i= 0; i<=19; i++ ) {
                temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B,30);
                B = A;
                A = temp;
            }

            for( i=20; i<=39; i++ ) {
                temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B,30);
                B = A;
                A = temp;
            }

            for( i=40; i<=59; i++ ) {
                temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B,30);
                B = A;
                A = temp;
            }

            for( i=60; i<=79; i++ ) {
                temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B,30);
                B = A;
                A = temp;
            }

            H0 = (H0 + A) & 0x0ffffffff;
            H1 = (H1 + B) & 0x0ffffffff;
            H2 = (H2 + C) & 0x0ffffffff;
            H3 = (H3 + D) & 0x0ffffffff;
            H4 = (H4 + E) & 0x0ffffffff;
        }

        return (cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4)).toLowerCase();
    }

    function setObProps(ob, ps) {
        var p;
        for (p in ps) {
            ob[p] = ps[p];
        }
        return ob;
    }

    /* Helper functions to allow alerts with selectable text in all browsers */
    function hideAlertWin() {
        var alertdiv = getMessageDiv();
        alertdiv.style.display = 'none';
        alertdiv.innerHTML = '';
    }

    function resolveMaxZIndex() {
        var maxZ = 0,
            next = document.body.firstChild;

        for (; next !== null; next = next.nextSibling) {
            if (next.nodeType == 1) {
                maxZ = Math.max(maxZ, parseInt(window.getComputedStyle(next).zIndex, 10) || 0);
            }
        }

        return maxZ;
    }

    /* Return or create the message div */
    function getMessageDiv() {
        var alertdiv = document.getElementById('password-hasher-alert');

        /* If alertdiv doesn't yet exist, create and inject into dom */
        if (alertdiv == null) {
            alertdiv = document.createElement('div');
            setObProps(alertdiv.style, {
                display: 'block',
                position: 'fixed',
                right: '10px',
                bottom: '10px',
                zIndex: resolveMaxZIndex() + 1
            });
            document.body.appendChild(alertdiv);
        } else {
            setObProps(alertdiv.style, {
                display: 'block'
            });
        }

        /* Initialize ID, set visible and clear contents */
        alertdiv.id = 'password-hasher-alert';
        alertdiv.innerHTML = '';

        return alertdiv;
    }

    /* Make sure the colors are black on white for maximum readability */
    function setHighContrastColors(node) {
        setObProps(node.style, {
            color: '#000',
            backgroundColor: '#fff',
            textAlign: 'left'
        });

        return node;
    }

    /* Create alert dialog */
    function universalAlert(msg) {
        var alertdiv  = setHighContrastColors(getMessageDiv()),
            message = setHighContrastColors(document.createElement('p')),
            closelink = document.createElement('a'),
            closecont = setHighContrastColors(document.createElement('p'));

        /* Create close link */
        setObProps(closelink, {
            href: '#',
            innerHTML: 'Hide this message',
            onclick: function hide() {
                hideAlertWin();
                return false;
            }
        });
        closecont.appendChild(closelink);

        /* Create message div */
        message.innerHTML = msg.replace(/\n/g, '<br>');

        /* Append elements to message div */
        alertdiv.appendChild(message);
        alertdiv.appendChild(closecont);

        /* Style message div so it will stand out against most backgrounds */
        alertdiv.id = 'password-hasher-alert';
        setObProps(alertdiv.style, {
            border: '3px solid #FF0000',
            display: 'block',
            padding: '10px',

        });
    }

    function passwordDialog() {
        var alertdiv  = setHighContrastColors(getMessageDiv()),
            message = setHighContrastColors(document.createElement('p')),
            closelink = document.createElement('a'),
            closecont = setHighContrastColors(document.createElement('p'));

        /* Create close link */
        setObProps(closelink, {
            href: '#',
            innerHTML: 'Hide this message',
            onclick: function () { hideAlertWin(); return false; }
        });
        closecont.appendChild(closelink);

        /* Set message */
        message.innerHTML = 'Enter password and hit enter to login';

        var form = document.createElement('form'),
            inp = document.createElement('input'),
            btn = document.createElement('button'),
            autosubmitChk = document.createElement('input'),
            autosubmitLbl = document.createElement('label');

        autosubmitLbl.appendChild(document.createTextNode('Autosubmit'));
        autosubmitLbl.insertBefore(autosubmitChk, autosubmitLbl.firstChild);

        setObProps(autosubmitLbl.style, {
            display: 'block'
        });

        form.action = '';
        form.onsubmit = function (ev) {
            var pass = inp.value;

            hideAlertWin();
            doHash(pass, autosubmitChk.checked);

            ev.preventDefault();
            ev.stopPropagation();

            return false;
        };

        autosubmitChk.type = 'checkbox';
        autosubmitChk.checked = 'true';

        inp.type = 'password';
        btn.innerHTML = 'Hash it!';

        /* Append elements to form */
        form.appendChild(autosubmitLbl);
        form.appendChild(inp);
        form.appendChild(btn);

        /* Append elements to message div */
        alertdiv.appendChild(message);
        alertdiv.appendChild(form);
        alertdiv.appendChild(closecont);

        /* Style message div so it will stand out against most backgrounds */
        alertdiv.id = 'password-hasher-alert';

        setObProps(alertdiv.style, {
            border: '3px solid #FF0000',
            padding: '10px'
        });

        /* Focus the password input */
        inp.focus();
    }

    function arrayContains(haystack, needle) {
        var i;

        for (i = 0; i < haystack.length; i++) {
            if (haystack[i] == needle) {
                return true;
            }
        }

        return false;
    }

    function doHash(passwd, autoSubmit) {
        var noSld = ['al', 'ar', 'au', 'bd', 'bn', 'br', 'bt', 'bv', 'cs', 'cy', 'dd', 'er', 'et', 'fk', 'gb', 'gh', 'gn', 'gu', 'gy', 'id', 'il', 'jm', 'kh', 'kp', 'kw', 'lb', 'lr', 'mm', 'mq', 'ms', 'mz', 'ni', 'np', 'nz', 'om', 'pa', 'pg', 'py', 'qa', 'sa', 'sb', 'sj', 'sv', 'sz', 'th', 'tz', 'uk', 'uy', 'va', 've', 'ws', 'ye', 'za', 'zm', 'zw'],
            tld = window.location.hostname.split('.').slice(-1)[0],

        /* Create pepper by appending user salt to current hostname */
            splitHost = arrayContains(noSld, tld) ?
                window.location.hostname.split('.').slice(-3) :
                window.location.hostname.split('.').slice(-2),
            host = splitHost.join('.'),
            pepper = salt + host,

        /* Create hash from combined pepper and password */
            hashedpass = SHA1(pepper + passwd).substr(0, limit),

        /* Convenience: loop through inputs to automate form filling */
            inputs = document.getElementsByTagName('input'),
            numpassinputs = 0,
            passinput = null;

        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type == 'password') {
                /* Try to detect and skip old/current password for change password forms */
                if (inputs[i].name.toLowerCase().indexOf('old') === -1 &&
                    inputs[i].name.toLowerCase().indexOf('current') === -1
                ) {
                    inputs[i].value = hashedpass;
                }

                numpassinputs++;

                /* Store the first password occurrence, this form will be autosubmitted if applicable */
                if (passinput == null) {
                    passinput = inputs[i];
                }
            }
        }

        if (numpassinputs == 0) {
            /* No type=password input detected, display hashed password. */
            universalAlert(
                'Autofill not possible, no password inputs detected.\nHashed password = ' +
                hashedpass +
                '\nUsed salt: ' +
                pepper
            );
        } else if (numpassinputs > 1 || !autoSubmit) {
            /* Multiple type=password inputs detected. Assume password change, display hashed password */
            universalAlert(
                'Not auto submitting.\nHashed password = ' +
                hashedpass +
                '\nUsed salt: ' +
                pepper
            );
            /* Focus the first encounterd password input anyway */
            passinput.focus();
        } else {
            /* Single type=password input, auto fill and submit */
            passinput.focus();
            passinput.form.submit();
        }
    }

    passwordDialog();
})(document);
