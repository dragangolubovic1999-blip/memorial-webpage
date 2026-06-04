/* ============================================
   您侄女魏文送给叔叔的一个礼物 — 脚本
   滚动动画 · 音乐控制 · 视频播放 · 交互效果
   ============================================ */

(function () {
  'use strict';

  // ==================== DOM 引用 ====================
  const cover = document.getElementById('cover');
  const btnOpenGift = document.getElementById('btn-open-gift');
  const mainContent = document.getElementById('main-content');
  const bgMusic = document.getElementById('bg-music');
  const musicControl = document.getElementById('music-control');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const progressFill = document.querySelector('.progress-fill');
  const btnPlayVideo = document.getElementById('btn-play-video');
  const videoDumpling = document.getElementById('video-dumpling');
  const fadeUpElements = document.querySelectorAll('.fade-up');
  const pageEnding = document.getElementById('page-ending');
  const timelineSection = document.querySelector('.timeline-section');

  // ==================== 状态 ====================
  let isMusicPlaying = false;
  let musicStarted = false;
  var DEFAULT_VOLUME = 0.25;    // 默认音量 25%
  var ENDING_VOLUME = 0.15;     // 结尾页音量 15%
  var isEndingVolume = false;

  // ==================== 工具函数 ====================
  /**
   * 检查元素是否进入视口
   */
  function isInViewport(el, offset = 0.15) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= windowHeight * (1 - offset) && rect.bottom >= 0;
  }

  // ==================== 滚动进度条 ====================
  function updateProgressBar() {
    if (!progressFill) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) {
      progressFill.style.width = '0%';
      return;
    }
    const progress = Math.min((scrollTop / scrollHeight) * 100, 100);
    progressFill.style.width = progress + '%';
  }

  // ==================== 滚动淡入动画 ====================
  function checkFadeUpElements() {
    fadeUpElements.forEach(function (el) {
      if (isInViewport(el, 0.12)) {
        el.classList.add('visible');
      }
    });
  }

  // ==================== 音乐控制 ====================
  function playMusic() {
    if (!bgMusic) return;
    // 设置默认音量
    bgMusic.volume = DEFAULT_VOLUME;
    var playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(function () {
          isMusicPlaying = true;
          musicStarted = true;
          updateMusicButtonState();
        })
        .catch(function (err) {
          // 自动播放被阻止，静默处理
          console.log('音乐自动播放被阻止，用户可以手动开启:', err.message);
          isMusicPlaying = false;
          updateMusicButtonState();
        });
    }
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isMusicPlaying = false;
    updateMusicButtonState();
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  function updateMusicButtonState() {
    if (!btnMusicToggle) return;
    if (isMusicPlaying) {
      btnMusicToggle.classList.add('playing');
    } else {
      btnMusicToggle.classList.remove('playing');
    }
  }

  // ==================== 结尾页音量渐降 ====================
  function checkEndingVolume() {
    if (!bgMusic || !isMusicPlaying) return;
    if (!pageEnding && !timelineSection) return;

    // 检查是否滚动到了结尾页或时间线区域
    var endingTop = Infinity;
    if (pageEnding) {
      var rect = pageEnding.getBoundingClientRect();
      endingTop = Math.min(endingTop, rect.top);
    }
    if (timelineSection) {
      var tRect = timelineSection.getBoundingClientRect();
      endingTop = Math.min(endingTop, tRect.top);
    }

    var windowHeight = window.innerHeight;
    // 当结尾区域进入视口时降低音量
    var shouldLower = endingTop < windowHeight * 0.6;

    if (shouldLower && !isEndingVolume) {
      // 平滑过渡到结尾音量
      bgMusic.volume = ENDING_VOLUME;
      isEndingVolume = true;
    } else if (!shouldLower && isEndingVolume) {
      // 离开结尾区域，恢复默认音量
      bgMusic.volume = DEFAULT_VOLUME;
      isEndingVolume = false;
    }
  }

  // ==================== 音乐错误处理 ====================
  function setupMusicErrorHandling() {
    if (!bgMusic) return;
    bgMusic.addEventListener('error', function (e) {
      console.error('背景音乐文件加载失败，请检查文件路径: assets/music/river-flows-in-you.mp3', e);
      // 隐藏音乐控制按钮
      if (musicControl) {
        musicControl.classList.add('hidden');
      }
      // 不阻塞页面其他功能
    });
  }
  function setupVideo() {
    if (!videoDumpling || !btnPlayVideo) return;

    // 点击播放按钮
    btnPlayVideo.addEventListener('click', function (e) {
      e.stopPropagation();
      if (videoDumpling.paused) {
        var playPromise = videoDumpling.play();
        if (playPromise !== undefined) {
          playPromise.then(function () {
            btnPlayVideo.classList.add('hidden');
          }).catch(function () {
            // 播放失败
          });
        }
      }
    });

    // 点击视频区域暂停/播放
    videoDumpling.addEventListener('click', function () {
      if (videoDumpling.paused) {
        videoDumpling.play();
        btnPlayVideo.classList.add('hidden');
      } else {
        videoDumpling.pause();
        btnPlayVideo.classList.remove('hidden');
      }
    });

    // 视频播放结束时显示按钮
    videoDumpling.addEventListener('ended', function () {
      btnPlayVideo.classList.remove('hidden');
    });

    // 触摸设备单独处理
    videoDumpling.addEventListener('play', function () {
      btnPlayVideo.classList.add('hidden');
    });

    videoDumpling.addEventListener('pause', function () {
      if (videoDumpling.ended) return;
      btnPlayVideo.classList.remove('hidden');
    });
  }

  // ==================== 开启礼物 ====================
  function openGift() {
    // 播放音乐
    playMusic();

    // 封面淡出
    cover.classList.add('fade-out');

    // 显示正文
    setTimeout(function () {
      cover.classList.add('hidden');
      mainContent.classList.remove('hidden');

      // 触发重排后添加可见类
      void mainContent.offsetWidth;
      mainContent.classList.add('visible');

      // 显示音乐控制
      musicControl.classList.remove('hidden');

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'instant' });

      // 延迟检查初始可见元素
      setTimeout(function () {
        checkFadeUpElements();
        updateProgressBar();
      }, 100);
    }, 600);
  }

  // ==================== 事件监听 ====================

  // 开启按钮
  if (btnOpenGift) {
    btnOpenGift.addEventListener('click', openGift);
  }

  // 音乐开关
  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', toggleMusic);
  }

  // 滚动事件（节流）
  var scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        checkFadeUpElements();
        updateProgressBar();
        checkEndingVolume();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // 页面大小改变时重新检查
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      checkFadeUpElements();
      updateProgressBar();
    }, 150);
  });

  // 键盘空格键控制音乐
  document.addEventListener('keydown', function (e) {
    // 如果焦点在输入框内，不处理
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }
    if (e.code === 'Space' && mainContent.classList.contains('visible')) {
      e.preventDefault();
      toggleMusic();
    }
  });

  // ==================== 初始化 ====================
  function init() {
    setupVideo();
    updateMusicButtonState();

    // 初始检查（封面页时不需要检查淡入元素）
    updateProgressBar();

    // 音乐加载完成后的处理
    if (bgMusic) {
      bgMusic.load();
      // 预设音量
      bgMusic.volume = DEFAULT_VOLUME;
    }

    // 设置音乐错误处理
    setupMusicErrorHandling();
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
