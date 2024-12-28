# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Backend

1. **PostgreSQL Connection Error**

   ```
   Error: Could not connect to PostgreSQL database
   ```

   **Solutions:**
   - Check if PostgreSQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists: `createdb neuroimaging_dashboard`
   - Check network connectivity and firewall settings

2. **Python Dependencies**

   ```
   Error: No module named 'nibabel'
   ```

   **Solutions:**
   - Activate virtual environment: `source venv/bin/activate`
   - Reinstall dependencies: `pip install -r requirements.txt`
   - For CUDA errors: `pip install nibabel --no-cache-dir`

3. **Permission Issues**

   ```
   Error: Permission denied: '/data'
   ```

   **Solutions:**
   - Check directory permissions: `ls -la /data`
   - Set correct ownership: `sudo chown -R $USER:$USER /data`
   - Create directory if missing: `mkdir -p /data`

#### Frontend

1. **Node.js Version Mismatch**

   ```shell
   Error: The engine "node" is incompatible with this module
   ```

   **Solutions:**
   - Install correct Node.js version: `nvm install 14`
   - Use specified version: `nvm use 14`
   - Update npm: `npm install -g npm@latest`

2. **Build Failures**

   ```
   Error: Failed to compile
   ```

   **Solutions:**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules package-lock.json`
   - Reinstall dependencies: `npm install`

### Runtime Issues

#### Data Processing

1. **Memory Errors**

   ```python
   MemoryError: Unable to allocate array
   ```

   **Solutions:**
   - Increase system swap space
   - Reduce batch size in pipeline configuration
   - Enable memory-efficient processing mode:

     ```python
     pipeline.set_memory_limit(0.8)  # Use 80% of available RAM
     ```

2. **CUDA Errors**

      ```python
   RuntimeError: CUDA out of memory
   ```

   **Solutions:**
   - Reduce batch size
   - Clear GPU memory:

     ```python
     import torch
     torch.cuda.empty_cache()
     ```

   - Monitor GPU usage: `nvidia-smi -l 1`

3. **File Format Issues**

         ```python
   Error: Invalid NIfTI header

   ```

   **Solutions:**
   - Check file integrity: `fslorient -getorient input.nii.gz`
   - Convert format: `mrconvert input.nii.gz output.nii.gz`
   - Validate headers: `fslhd input.nii.gz`

#### Database

1. **Connection Pool Exhaustion**

   ```
   Error: Too many database connections
   ```

   **Solutions:**
   - Adjust pool settings in `config.py`:

     ```python
     SQLALCHEMY_POOL_SIZE = 20
     SQLALCHEMY_MAX_OVERFLOW = 5
     ```

   - Monitor connections: `SELECT * FROM pg_stat_activity;`

2. **Slow Queries**

   ```
   Warning: Query took longer than 5000ms
   ```

   **Solutions:**
   - Add indexes:

     ```sql
     CREATE INDEX idx_subject_diagnosis ON subjects(diagnosis);
     ```

   - Optimize query:

     ```python
     # Before
     subjects = Subject.query.all()
     
     # After
     subjects = Subject.query.filter(Subject.active == True).all()
     ```

### API Issues

1. **Rate Limiting**

   ```
   Error: 429 Too Many Requests
   ```

   **Solutions:**
   - Implement request caching
   - Add exponential backoff:

     ```python
     def retry_with_backoff(func, max_retries=3):
         for i in range(max_retries):
             try:
                 return func()
             except RateLimitError:
                 time.sleep(2 ** i)
     ```

2. **Authentication Failures**

   ```
   Error: Invalid token
   ```

   **Solutions:**
   - Check token expiration
   - Verify secret key configuration
   - Refresh token if expired

### Frontend Issues

1. **Performance**

   ```
   Warning: Component is re-rendering too often
   ```

   **Solutions:**
   - Implement memoization:

     ```javascript
     const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
     ```

   - Use React.memo for components:

     ```javascript
     export default React.memo(MyComponent);
     ```

2. **WebGL Rendering**

   ```
   Error: WebGL context lost
   ```

   **Solutions:**
   - Check browser compatibility
   - Reduce rendering complexity
   - Enable hardware acceleration

### Docker Issues

1. **Container Startup**

   ```
   Error: Container exited with code 1
   ```

   **Solutions:**
   - Check logs: `docker-compose logs`
   - Verify environment variables
   - Ensure volume permissions

2. **Resource Constraints**

   ```
   Error: No space left on device
   ```

   **Solutions:**
   - Clean unused images: `docker system prune`
   - Increase Docker resources
   - Monitor usage: `docker stats`

## Monitoring and Debugging

### Backend Monitoring

1. Enable detailed logging:

   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

2. Monitor system resources:

   ```bash
   htop  # CPU and memory
   iotop  # Disk I/O
   ```

### Frontend Monitoring

1. Enable React DevTools
2. Monitor network requests in browser DevTools
3. Enable performance profiling:

   ```javascript
   if (process.env.NODE_ENV === 'development') {
     const whyDidYouRender = require('@welldone-software/why-did-you-render');
     whyDidYouRender(React);
   }
   ```

## Performance Optimization

### Database Optimization

1. Add appropriate indexes
2. Implement query caching
3. Regular VACUUM and ANALYZE

### Application Optimization

1. Enable compression:

   ```nginx
   gzip on;
   gzip_types text/plain application/json;
   ```

2. Implement caching:

   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=128)
   def expensive_computation(data):
       # ...
   ```

## Getting Help

1. Check logs:

   ```bash
   tail -f logs/app.log
   docker-compose logs -f
   ```

2. Generate debug report:

   ```bash
   ./scripts/generate_debug_report.sh
   ```

3. Contact support:
   - GitHub Issues
   - Support email: <support@example.com>
   - Community Slack
