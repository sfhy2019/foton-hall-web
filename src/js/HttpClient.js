class HttpClient {
    constructor(baseURL) {
      this.baseURL = baseURL;
    }
  
    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
  
      const config = {
        ...options,
        headers,
      };
  
      try {
        const response = await fetch(url, config);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    }
  
    get(endpoint, params = {}, options = {}) {
      const urlParams = new URLSearchParams();
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          urlParams.append(key, params[key]);
        }
      }
      const queryString = urlParams.toString().replace(/%2F/g, '/');
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      return this.request(url, { ...options, method: 'GET' });
    }
  
    post(endpoint, body, options = {}) {
      return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    }
  
    put(endpoint, body, options = {}) {
      return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
    }
  
    delete(endpoint, options = {}) {
      return this.request(endpoint, { ...options, method: 'DELETE' });
    }
  }
  
  export default HttpClient;