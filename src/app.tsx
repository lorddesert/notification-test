import './app.css'
import './pico.yellow.css'

export function App() {


  /* global $ */
  /**
   * Determine if running on a Chromium browser on Android
   *
   * @returns Boolean
   */
  function isChromiumOnAndroid() {
    if (navigator.userAgent.match(/Android/i) && navigator.userAgent.match(/Chrome/i)) {
      return true;
    }
  }


  /**
   * Initialize the state of inputs & information based on feature detection
   * @returns undefined
   */
  function initialize() {
    if (!('Notification' in window)) {
      document.getElementById('support-status').innerHTML = 'no';

      return;
    } else {
      if (isChromiumOnAndroid()) {
        document.getElementById('mobile-selector').checked = true;
      }

      document.getElementById('support-status').innerHTML = 'yes';
      document.getElementById('permission-status-field').style.visibility = 'visible';
      document.getElementById('notification-status-field').style.visibility = 'visible';
      document.getElementById('notification-field').style.visibility = 'visible';

      updatePermissionStatus();
    }
  }


  /**
   * Update the displayed status for notification permission
   */
  function updatePermissionStatus() {
    var output = Notification.permission;

    if (output === 'default') {
      output = 'not yet';
    }

    document.getElementById('permission-status').innerHTML = output;
  }


  /**
   * Display a notification if determined to be on mobile
   */
  function showWorkerNotification() {
    navigator.serviceWorker.register('https://www.kenherbert.dev/static/js//browser-notifications-test-worker.js').then(function (registration) {
      registration.update();

      const messageChannel = new MessageChannel();

      registration.active.postMessage({
        type: 'CONNECT'
      }, [messageChannel.port2]);


      messageChannel.port1.onmessage = function (event) {
        if (event.data.payload === 'closed') {
          document.getElementById('notification-status').innerHTML = 'closed';
        }
      };


      registration.showNotification('This is a notification', { body: 'Do you see it?', requireInteraction: true, icon: 'https://kenherbert.dev/static/img/kh-logo.png' })
        .then(function () {
          document.getElementById('notification-status').innerHTML = 'displayed';
        });
    });
  }


  /**
   * Show a notification if determined to be on other platforms
   */
  function showStandardNotification() {
    var notification = new Notification('This is a notification', {
      body: 'Do you see it?',
      requireInteraction: true,
      icon: 'https://kenherbert.dev/static/img/kh-logo.png'
    });

    notification.onshow = function () {
      document.getElementById('notification-status').innerHTML = 'displayed';
    };

    notification.onerror = function (event) {
      document.getElementById('notification-status').innerHTML = 'no - an error occurred: ' + event.type;
    };

    notification.onclose = function () {
      document.getElementById('notification-status').innerHTML = 'closed';
    };
  }


  /**
   * Call the necessary notification method based on determined platform
   */

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function notify() {
    if (document.getElementById('mobile-selector').checked) {
      await sleep(1000)
      showWorkerNotification()
    } else {
      await sleep(1000)
      showStandardNotification()
    }
  }


  document.getElementById('notify').onclick = function () {
    if (Notification.permission === 'granted') {
      document.getElementById('notification-status').innerHTML = 'pending';

      notify();
    } else if (Notification.permission !== 'denied') {
      document.getElementById('permission-status').innerHTML = 'requesting permission';

      Notification.requestPermission().then(function (permission) {
        updatePermissionStatus();

        if (permission === 'granted') {
          notify();
        } else if (permission === 'denied') {
          document.getElementById('notification-status').innerHTML = 'no';
        }
      });
    }
  };

  initialize();

  return (
    <>
      <article>
        <section>
          <label for="mobile-selector">
            <input type="checkbox" name="mobile-selector" id="mobile-selector" />
            Mobile
          </label>
        </section>
      </article>
    </>
  )
}
